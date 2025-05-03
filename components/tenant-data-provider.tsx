"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

// Definir el tipo para los datos del tenant
interface TenantData {
  id: string
  name: string
  subdomain: string
  ownerId: string
  status: string
  [key: string]: any
}

// Crear el contexto
interface TenantContextType {
  tenantData: TenantData | null
  loading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

// Hook para usar el contexto
export function useTenantData() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenantData debe ser usado dentro de un TenantDataProvider")
  }
  return context
}

// Proveedor de datos del tenant
export function TenantDataProvider({ children, subdomain }: { children: ReactNode; subdomain: string }) {
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenantData() {
      try {
        setLoading(true)
        setError(null)

        // Verificar si el tenant existe
        const tenantsRef = collection(db, "tenants")
        const q = query(tenantsRef, where("subdomain", "==", subdomain))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError(`Tenant "${subdomain}" no encontrado`)
          setTenantData(null)
          return
        }

        const tenantDoc = querySnapshot.docs[0]
        setTenantData({
          id: tenantDoc.id,
          ...tenantDoc.data(),
        } as TenantData)
      } catch (error: any) {
        console.error("Error al obtener datos del tenant:", error)
        setError(error.message || "Error al cargar datos del tenant")
      } finally {
        setLoading(false)
      }
    }

    fetchTenantData()
  }, [subdomain])

  return <TenantContext.Provider value={{ tenantData, loading, error }}>{children}</TenantContext.Provider>
}
