import { db } from "@/lib/firebase/client"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import type { CashRegister } from "@/lib/types/cash-register"

// Obtener la caja actual (abierta)
export async function getCurrentCashRegister(tenantId: string, branchId: string): Promise<CashRegister | null> {
  try {
    const q = query(
      collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`),
      where("status", "==", "open"),
      orderBy("openedAt", "desc"),
      limit(1),
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as CashRegister
  } catch (error) {
    console.error("Error al obtener la caja actual:", error)
    throw error
  }
}

// Obtener una caja específica por ID
export async function getCashRegisterById(
  tenantId: string,
  branchId: string,
  cashRegisterId: string,
): Promise<CashRegister | null> {
  try {
    const docRef = doc(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`, cashRegisterId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as CashRegister
  } catch (error) {
    console.error("Error al obtener la caja:", error)
    throw error
  }
}

// Obtener historial de cajas
export async function getCashRegisterHistory(tenantId: string, branchId: string): Promise<CashRegister[]> {
  try {
    const q = query(
      collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`),
      orderBy("openedAt", "desc"),
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashRegister[]
  } catch (error) {
    console.error("Error al obtener el historial de cajas:", error)
    throw error
  }
}

// Abrir una nueva caja
export async function openCashRegister(
  tenantId: string,
  branchId: string,
  data: {
    initialAmount: number
    openedBy: string
    notes?: string
  },
): Promise<CashRegister> {
  try {
    // Verificar si ya hay una caja abierta
    const currentCashRegister = await getCurrentCashRegister(tenantId, branchId)
    if (currentCashRegister) {
      throw new Error("Ya hay una caja abierta")
    }

    const cashRegisterData = {
      initialAmount: data.initialAmount,
      openedBy: data.openedBy,
      openedAt: serverTimestamp(),
      status: "open",
      notes: data.notes || "",
    }

    const docRef = await addDoc(
      collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`),
      cashRegisterData,
    )

    return {
      id: docRef.id,
      ...cashRegisterData,
      openedAt: Timestamp.now().toDate(),
    } as CashRegister
  } catch (error) {
    console.error("Error al abrir la caja:", error)
    throw error
  }
}

// Cerrar una caja
export async function closeCashRegister(
  tenantId: string,
  branchId: string,
  cashRegisterId: string,
  data: {
    finalAmount: number
    expectedAmount: number
    closedBy: string
    notes?: string
  },
): Promise<CashRegister> {
  try {
    const docRef = doc(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`, cashRegisterId)

    const updateData = {
      finalAmount: data.finalAmount,
      expectedAmount: data.expectedAmount,
      closedBy: data.closedBy,
      closedAt: serverTimestamp(),
      status: "closed",
      closingNotes: data.notes || "",
    }

    await updateDoc(docRef, updateData)

    // Obtener el documento actualizado
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("No se encontró la caja")
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as CashRegister
  } catch (error) {
    console.error("Error al cerrar la caja:", error)
    throw error
  }
}

// Verificar si hay una caja abierta
export async function hasCashRegisterOpen(tenantId: string, branchId: string): Promise<boolean> {
  try {
    const currentCashRegister = await getCurrentCashRegister(tenantId, branchId)
    return currentCashRegister !== null
  } catch (error) {
    console.error("Error al verificar si hay una caja abierta:", error)
    throw error
  }
}
