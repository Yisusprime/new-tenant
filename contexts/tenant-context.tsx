"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

interface TenantContextType {
  tenantId: string | null
  isMainDomain: boolean
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  isMainDomain: true,
})

export const useTenant = () => useContext(TenantContext)

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isMainDomain, setIsMainDomain] = useState<boolean>(true)
  const pathname = usePathname()

  useEffect(() => {
    // Detectar el subdominio
    const hostname = window.location.hostname
    const mainDomain = process.env.NEXT_PUBLIC_DOMAIN || "gastroo.online"

    if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
      setIsMainDomain(true)
      setTenantId(null)
    } else {
      const subdomain = hostname.split(".")[0]
      setTenantId(subdomain)
      setIsMainDomain(false)
    }
  }, [pathname])

  return <TenantContext.Provider value={{ tenantId, isMainDomain }}>{children}</TenantContext.Provider>
}
