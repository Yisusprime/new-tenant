import { ref, get, set, update, remove, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"

export interface Table {
  id: string
  number: string
  capacity: number
  isActive: boolean
  status: "available" | "occupied" | "reserved" | "maintenance"
  location?: string
  createdAt: string
  updatedAt: string
}

// Función para obtener todas las mesas de una sucursal
export async function getTables(tenantId: string, branchId: string): Promise<Table[]> {
  try {
    const tablesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables`)
    const snapshot = await get(tablesRef)

    if (!snapshot.exists()) {
      return []
    }

    const tablesData = snapshot.val()

    // Convertir el objeto a un array
    const tables = Object.entries(tablesData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as Table[]

    // Ordenar por número de mesa
    return tables.sort((a, b) => {
      const numA = Number.parseInt(a.number)
      const numB = Number.parseInt(b.number)
      return isNaN(numA) || isNaN(numB) ? a.number.localeCompare(b.number) : numA - numB
    })
  } catch (error) {
    console.error("Error al obtener mesas:", error)
    throw error
  }
}

// Función para obtener una mesa específica
export async function getTable(tenantId: string, branchId: string, tableId: string): Promise<Table | null> {
  try {
    const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${tableId}`)
    const snapshot = await get(tableRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: tableId,
      ...snapshot.val(),
    } as Table
  } catch (error) {
    console.error("Error al obtener mesa:", error)
    throw error
  }
}

// Modificar la función createTable para eliminar propiedades undefined
export async function createTable(
  tenantId: string,
  branchId: string,
  tableData: Omit<Table, "id" | "createdAt" | "updatedAt">,
): Promise<Table> {
  try {
    const timestamp = new Date().toISOString()
    const tablesRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables`)

    // Generar un nuevo ID para la mesa
    const newTableRef = push(tablesRef)
    const tableId = newTableRef.key!

    // Crear un objeto limpio sin propiedades undefined
    const cleanTableData = { ...tableData }

    // Si location es undefined o vacío, eliminarlo del objeto
    if (!cleanTableData.location) {
      delete cleanTableData.location
    }

    const newTable: Omit<Table, "id"> = {
      ...cleanTableData,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Guardar la mesa en Realtime Database
    await set(newTableRef, newTable)

    return {
      id: tableId,
      ...newTable,
    } as Table
  } catch (error) {
    console.error("Error al crear mesa:", error)
    throw error
  }
}

// También modificar la función updateTable para el mismo problema
export async function updateTable(
  tenantId: string,
  branchId: string,
  tableId: string,
  tableData: Partial<Omit<Table, "id" | "createdAt" | "updatedAt">>,
): Promise<Table> {
  try {
    const timestamp = new Date().toISOString()
    const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${tableId}`)

    // Obtener la mesa actual
    const snapshot = await get(tableRef)
    if (!snapshot.exists()) {
      throw new Error("La mesa no existe")
    }

    const currentTable = snapshot.val()

    // Crear un objeto limpio sin propiedades undefined
    const cleanTableData = { ...tableData }

    // Si location es undefined o vacío, eliminarlo del objeto
    if (cleanTableData.location === undefined || cleanTableData.location === "") {
      delete cleanTableData.location
    }

    // Preparar datos de actualización
    const updatedData = {
      ...cleanTableData,
      updatedAt: timestamp,
    }

    // Actualizar la mesa en Realtime Database
    await update(tableRef, updatedData)

    return {
      id: tableId,
      ...currentTable,
      ...updatedData,
    } as Table
  } catch (error) {
    console.error("Error al actualizar mesa:", error)
    throw error
  }
}

// Función para actualizar el estado de una mesa
export async function updateTableStatus(
  tenantId: string,
  branchId: string,
  tableId: string,
  status: "available" | "occupied" | "reserved" | "maintenance",
): Promise<Table> {
  try {
    return await updateTable(tenantId, branchId, tableId, { status })
  } catch (error) {
    console.error("Error al actualizar estado de mesa:", error)
    throw error
  }
}

// Función para eliminar una mesa
export async function deleteTable(tenantId: string, branchId: string, tableId: string): Promise<void> {
  try {
    const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${tableId}`)

    // Verificar si la mesa existe
    const snapshot = await get(tableRef)
    if (!snapshot.exists()) {
      throw new Error("La mesa no existe")
    }

    // Eliminar la mesa de Realtime Database
    await remove(tableRef)
  } catch (error) {
    console.error("Error al eliminar mesa:", error)
    throw error
  }
}
