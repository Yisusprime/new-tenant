"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Tenant } from "@/hooks/useTenant"

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
})

export function TenantProvider({
  children,
  tenant,
  isLoading,
}: {
  children: ReactNode
  tenant: Tenant | null
  isLoading: boolean
}) {
  return <TenantContext.Provider value={{ tenant, isLoading }}>{children}</TenantContext.Provider>
}

export function useTenantContext() {
  return useContext(TenantContext)
}
