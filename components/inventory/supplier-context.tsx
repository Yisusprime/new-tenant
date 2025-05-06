"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import type { Supplier } from "@/lib/types/inventory"
import { useToast } from "@/components/ui/use-toast"

interface SupplierContextType {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
  getSupplierById: (id: string) => Supplier | undefined
  getSuppliersByCategory: (category: string) => Supplier[]
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined)

export function SupplierProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!tenantId) return

    setLoading(true)
    const suppliersRef = collection(db, `tenants/${tenantId}/suppliers`)
    const q = query(suppliersRef, orderBy("name"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const suppliersList: Supplier[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          suppliersList.push({
            id: doc.id,
            name: data.name,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            notes: data.notes,
            categories: data.categories || [],
            paymentTerms: data.paymentTerms,
            isActive: data.isActive,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          })
        })
        setSuppliers(suppliersList)
        setLoading(false)
      },
      (err) => {
        console.error("Error al obtener proveedores:", err)
        setError("Error al cargar los proveedores. Por favor, intenta de nuevo.")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [tenantId])

  const addSupplier = async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    try {
      const suppliersRef = collection(db, `tenants/${tenantId}/suppliers`)
      const newSupplier = {
        ...supplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      const docRef = await addDoc(suppliersRef, newSupplier)
      toast({
        title: "Proveedor añadido",
        description: `El proveedor ${supplier.name} ha sido añadido correctamente.`,
      })
      return docRef.id
    } catch (err: any) {
      console.error("Error al añadir proveedor:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo añadir el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    try {
      const supplierRef = doc(db, `tenants/${tenantId}/suppliers/${id}`)
      await updateDoc(supplierRef, {
        ...supplier,
        updatedAt: serverTimestamp(),
      })
      toast({
        title: "Proveedor actualizado",
        description: "El proveedor ha sido actualizado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al actualizar proveedor:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo actualizar el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteSupplier = async (id: string) => {
    try {
      const supplierRef = doc(db, `tenants/${tenantId}/suppliers/${id}`)
      await deleteDoc(supplierRef)
      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado correctamente.",
      })
    } catch (err: any) {
      console.error("Error al eliminar proveedor:", err)
      setError(err.message)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
      throw err
    }
  }

  const getSupplierById = (id: string) => {
    return suppliers.find((supplier) => supplier.id === id)
  }

  const getSuppliersByCategory = (category: string) => {
    return suppliers.filter((supplier) => supplier.categories.includes(category))
  }

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        loading,
        error,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplierById,
        getSuppliersByCategory,
      }}
    >
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliers() {
  const context = useContext(SupplierContext)
  if (context === undefined) {
    throw new Error("useSuppliers debe ser usado dentro de un SupplierProvider")
  }
  return context
}
