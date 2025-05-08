import { db } from "@/lib/firebase/client"
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore"

export interface Branch {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  tenantId: string
  managerId?: string
}

// Función para crear una nueva sucursal (desde el lado del cliente)
export async function createBranch(tenantId: string, branchData: Omit<Branch, "id" | "createdAt" | "tenantId">) {
  try {
    const branchId = crypto.randomUUID().substring(0, 8)
    const createdAt = new Date().toISOString()

    const newBranch: Branch = {
      id: branchId,
      ...branchData,
      createdAt,
      tenantId,
      isActive: true,
    }

    // Guardar la sucursal en Firestore
    await setDoc(doc(db, `tenants/${tenantId}/branches`, branchId), newBranch)

    return newBranch
  } catch (error) {
    console.error("Error al crear sucursal:", error)
    throw error
  }
}

// Función para obtener todas las sucursales de un tenant
export async function getBranches(tenantId: string) {
  try {
    const branchesRef = collection(db, `tenants/${tenantId}/branches`)
    const branchesSnapshot = await getDocs(branchesRef)

    return branchesSnapshot.docs.map((doc) => doc.data() as Branch)
  } catch (error) {
    console.error("Error al obtener sucursales:", error)
    throw error
  }
}

// Función para obtener una sucursal específica
export async function getBranch(tenantId: string, branchId: string) {
  try {
    const branchRef = doc(db, `tenants/${tenantId}/branches`, branchId)
    const branchSnapshot = await getDoc(branchRef)

    if (!branchSnapshot.exists()) {
      return null
    }

    return branchSnapshot.data() as Branch
  } catch (error) {
    console.error("Error al obtener sucursal:", error)
    throw error
  }
}

// Función para actualizar una sucursal
export async function updateBranch(tenantId: string, branchId: string, branchData: Partial<Branch>) {
  try {
    const branchRef = doc(db, `tenants/${tenantId}/branches`, branchId)
    await setDoc(branchRef, branchData, { merge: true })

    return true
  } catch (error) {
    console.error("Error al actualizar sucursal:", error)
    throw error
  }
}

// Función para asignar un usuario como gerente de sucursal
export async function assignBranchManager(tenantId: string, branchId: string, userId: string) {
  try {
    // Actualizar la sucursal con el ID del gerente
    await updateBranch(tenantId, branchId, { managerId: userId })

    // Asignar rol de gerente al usuario
    await setDoc(
      doc(db, `tenants/${tenantId}/roles`, userId),
      {
        role: "branch_manager",
        branchId: branchId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    )

    return true
  } catch (error) {
    console.error("Error al asignar gerente:", error)
    throw error
  }
}
