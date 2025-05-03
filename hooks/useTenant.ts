"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Tenant {
  id: string
  name: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  features: string[]
  isActive: boolean
  createdAt: Date
}

export function useTenant(tenantId: string | null) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTenant() {
      if (!tenantId) {
        setLoading(false)
        return
      }

      try {
        const tenantRef = doc(db, "tenants", tenantId)
        const tenantSnap = await getDoc(tenantRef)

        if (tenantSnap.exists()) {
          const tenantData = tenantSnap.data() as Omit<Tenant, "id">
          setTenant({
            id: tenantSnap.id,
            ...tenantData,
            createdAt: tenantData.createdAt?.toDate() || new Date(),
          })
        } else {
          setError(new Error(`Tenant ${tenantId} no encontrado`))
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Error desconocido"))
      } finally {
        setLoading(false)
      }
    }

    fetchTenant()
  }, [tenantId])

  return { tenant, loading, error }
}
