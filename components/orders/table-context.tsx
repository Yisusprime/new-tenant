"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, get, set, push, remove, update } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import type { Table } from "@/lib/types/orders"

interface TableContextProps {
  tables: Table[]
  loading: boolean
  error: string | null
  addTable: (table: Omit<Table, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateTable: (id: string, table: Partial<Omit<Table, "id" | "createdAt" | "updatedAt">>) => Promise<void>
  deleteTable: (id: string) => Promise<void>
  getTable: (id: string) => Promise<Table | null>
  refreshTables: () => Promise<void>
}

const TableContext = createContext<TableContextProps | undefined>(undefined)

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider")
  }
  return context
}

interface TableProviderProps {
  children: ReactNode
  tenantId: string
}

export const TableProvider: React.FC<TableProviderProps> = ({ children, tenantId }) => {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Validar el tenantId al inicializar
  useEffect(() => {
    if (!tenantId) {
      console.error("TableProvider initialized with invalid tenantId:", tenantId)
      setError("Error: No se proporcionó un ID de inquilino válido")
    } else {
      console.log("TableProvider initialized with tenantId:", tenantId)
    }
  }, [tenantId])

  const fetchTables = async () => {
    try {
      setLoading(true)
      console.log("Fetching tables for tenant:", tenantId)

      if (!tenantId || tenantId === "undefined" || tenantId === "null") {
        console.error("Invalid tenantId provided to TableProvider:", tenantId)
        setError("Error: ID de inquilino inválido")
        setLoading(false)
        return
      }

      // Usar Realtime Database en lugar de Firestore
      const tablesRef = ref(rtdb, `tenants/${tenantId}/tables`)
      console.log(`Ruta de tablas: tenants/${tenantId}/tables`)

      const tablesSnapshot = await get(tablesRef)
      const tablesData = tablesSnapshot.val() || {}

      console.log("Datos de tablas cargados:", tablesData)

      const fetchedTables: Table[] = Object.keys(tablesData).map((key) => ({
        id: key,
        ...tablesData[key],
      }))

      // Ordenar las mesas por número
      fetchedTables.sort((a, b) => a.number - b.number)

      console.log("Fetched tables:", fetchedTables.length)
      setTables(fetchedTables)
      setError(null)
    } catch (err) {
      console.error("Error fetching tables:", err)
      setError("Error al cargar las mesas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchTables()
    } else {
      setLoading(false)
      setError("No se proporcionó un ID de inquilino")
    }
  }, [tenantId])

  const addTable = async (tableData: Omit<Table, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!tenantId || tenantId === "undefined" || tenantId === "null") {
        console.error("Invalid tenantId provided to addTable:", tenantId)
        setError("Error: ID de inquilino inválido")
        throw new Error("Invalid tenantId provided")
      }

      console.log(`Añadiendo mesa para el tenant: ${tenantId}`)

      // Usar Realtime Database en lugar de Firestore
      const tablesRef = ref(rtdb, `tenants/${tenantId}/tables`)
      const newTableRef = push(tablesRef)

      const timestamp = Date.now()
      const newTable = {
        ...tableData,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      await set(newTableRef, newTable)
      await fetchTables()
      return newTableRef.key || ""
    } catch (err) {
      console.error("Error adding table:", err)
      setError("Error al añadir la mesa")
      throw err
    }
  }

  const updateTable = async (id: string, tableData: Partial<Omit<Table, "id" | "createdAt" | "updatedAt">>) => {
    try {
      if (!tenantId || tenantId === "undefined" || tenantId === "null") {
        console.error("Invalid tenantId provided to updateTable:", tenantId)
        setError("Error: ID de inquilino inválido")
        throw new Error("Invalid tenantId provided")
      }

      // Obtener el tenantId de la tabla existente o usar el proporcionado
      const tenantIdToUse = tableData.tenantId || tenantId

      console.log(`Actualizando mesa para el tenant: ${tenantIdToUse}`)

      // Usar Realtime Database en lugar de Firestore
      const tableRef = ref(rtdb, `tenants/${tenantIdToUse}/tables/${id}`)

      // Obtener datos actuales para no sobrescribir campos que no se están actualizando
      const currentTableSnapshot = await get(tableRef)
      const currentTable = currentTableSnapshot.val() || {}

      await update(tableRef, {
        ...currentTable,
        ...tableData,
        updatedAt: Date.now(),
      })

      await fetchTables()
    } catch (err) {
      console.error("Error updating table:", err)
      setError("Error al actualizar la mesa")
      throw err
    }
  }

  const deleteTable = async (id: string) => {
    try {
      if (!tenantId || tenantId === "undefined" || tenantId === "null") {
        console.error("Invalid tenantId provided to deleteTable:", tenantId)
        setError("Error: ID de inquilino inválido")
        throw new Error("Invalid tenantId provided")
      }

      console.log(`Eliminando mesa para el tenant: ${tenantId}`)

      // Usar Realtime Database en lugar de Firestore
      const tableRef = ref(rtdb, `tenants/${tenantId}/tables/${id}`)
      await remove(tableRef)

      await fetchTables()
    } catch (err) {
      console.error("Error deleting table:", err)
      setError("Error al eliminar la mesa")
      throw err
    }
  }

  const getTable = async (id: string): Promise<Table | null> => {
    try {
      if (!tenantId || tenantId === "undefined" || tenantId === "null") {
        console.error("Invalid tenantId provided to getTable:", tenantId)
        setError("Error: ID de inquilino inválido")
        throw new Error("Invalid tenantId provided")
      }

      // Usar Realtime Database en lugar de Firestore
      const tableRef = ref(rtdb, `tenants/${tenantId}/tables/${id}`)
      const tableSnapshot = await get(tableRef)

      if (tableSnapshot.exists()) {
        return {
          id,
          ...tableSnapshot.val(),
        } as Table
      }

      return null
    } catch (err) {
      console.error("Error getting table:", err)
      setError("Error al obtener la mesa")
      throw err
    }
  }

  const value = {
    tables,
    loading,
    error,
    addTable,
    updateTable,
    deleteTable,
    getTable,
    refreshTables: fetchTables,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}
