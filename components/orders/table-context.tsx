"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { collection, query, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
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

  const fetchTables = async () => {
    try {
      setLoading(true)
      console.log("Fetching tables for tenant:", tenantId)

      if (!tenantId) {
        console.error("No tenantId provided to TableProvider")
        setError("Error: No se proporcionó un ID de inquilino")
        setLoading(false)
        return
      }

      const tablesCollectionRef = collection(db, `tenants/${tenantId}/tables`)
      const q = query(tablesCollectionRef, orderBy("number", "asc"))
      const querySnapshot = await getDocs(q)

      const fetchedTables: Table[] = []
      querySnapshot.forEach((doc) => {
        fetchedTables.push({ id: doc.id, ...doc.data() } as Table)
      })

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

  const addTable = async (table: Omit<Table, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const tablesCollectionRef = collection(db, `tenants/${tenantId}/tables`)
      const timestamp = Date.now()
      const newTable = {
        ...table,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const docRef = await addDoc(tablesCollectionRef, newTable)
      await fetchTables()
      return docRef.id
    } catch (err) {
      console.error("Error adding table:", err)
      setError("Error al añadir la mesa")
      throw err
    }
  }

  const updateTable = async (id: string, tableData: Partial<Omit<Table, "id" | "createdAt" | "updatedAt">>) => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const tableRef = doc(db, `tenants/${tenantId}/tables/${id}`)
      await updateDoc(tableRef, {
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
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const tableRef = doc(db, `tenants/${tenantId}/tables/${id}`)
      await deleteDoc(tableRef)
      await fetchTables()
    } catch (err) {
      console.error("Error deleting table:", err)
      setError("Error al eliminar la mesa")
      throw err
    }
  }

  const getTable = async (id: string): Promise<Table | null> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const tableRef = doc(db, `tenants/${tenantId}/tables/${id}`)
      const tableDoc = await getDoc(tableRef)

      if (tableDoc.exists()) {
        return { id: tableDoc.id, ...tableDoc.data() } as Table
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
