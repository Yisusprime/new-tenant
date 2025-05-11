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
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import type { CashRegister } from "@/lib/types/cash-register"

// Obtener la caja actual (abierta) - Versión modificada sin índices compuestos
export async function getCurrentCashRegister(tenantId: string, branchId: string): Promise<CashRegister | null> {
  try {
    // Consulta simple: solo filtrar por status sin ordenar
    const q = query(
      collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`),
      where("status", "==", "open"),
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    // Si hay múltiples cajas abiertas (no debería ocurrir), ordenamos en el cliente
    const openRegisters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashRegister[]

    // Ordenar por openedAt en el cliente (más reciente primero)
    openRegisters.sort((a, b) => {
      const dateA = a.openedAt instanceof Timestamp ? a.openedAt.toDate().getTime() : new Date(a.openedAt).getTime()
      const dateB = b.openedAt instanceof Timestamp ? b.openedAt.toDate().getTime() : new Date(b.openedAt).getTime()
      return dateB - dateA
    })

    // Devolver la caja más reciente
    return openRegisters[0]
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

// Obtener historial de cajas - Versión modificada sin índices compuestos
export async function getCashRegisterHistory(tenantId: string, branchId: string): Promise<CashRegister[]> {
  try {
    // Consulta simple sin ordenar
    const q = query(collection(db, `tenants/${tenantId}/branches/${branchId}/cashRegisters`))

    const snapshot = await getDocs(q)

    const registers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CashRegister[]

    // Ordenar por openedAt en el cliente (más reciente primero)
    registers.sort((a, b) => {
      const dateA = a.openedAt instanceof Timestamp ? a.openedAt.toDate().getTime() : new Date(a.openedAt).getTime()
      const dateB = b.openedAt instanceof Timestamp ? b.openedAt.toDate().getTime() : new Date(b.openedAt).getTime()
      return dateB - dateA
    })

    return registers
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
      summary: {
        totalOrders: 0,
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalOtherMethods: 0,
      },
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
      difference: data.finalAmount - data.expectedAmount,
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

// Función para obtener pedidos por caja registradora
export async function getOrdersByCashRegister(
  tenantId: string,
  branchId: string,
  cashRegisterId: string,
): Promise<any[]> {
  // Esta función se implementará cuando sea necesario
  // Por ahora, devolvemos un array vacío
  return []
}
