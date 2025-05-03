"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Tenant } from "../models/tenant"
import { getTenantBySubdomain } from "../services/tenant-service"

interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
})

export const useTenant = () => useContext(TenantContext)

export const TenantProvider: React.FC<{
  children: React.ReactNode
  subdomain?: string
}> = ({ children, subdomain }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTenant = async () => {
      if (!subdomain) {
        setLoading(false)
        return
      }

      try {
        const tenantData = await getTenantBySubdomain(subdomain)

        if (!tenantData) {
          setError("Tenant not found")
        } else {
          setTenant(tenantData)
        }
      } catch (err) {
        setError("Error loading tenant")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadTenant()
  }, [subdomain])

  return <TenantContext.Provider value={{ tenant, loading, error }}>{children}</TenantContext.Provider>
}
