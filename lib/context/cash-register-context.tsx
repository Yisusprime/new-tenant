"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCurrentCashRegister, hasCashRegisterOpen } from "@/lib/services/cash-register-service"
import type { CashRegister } from "@/lib/types/cash-register"

interface CashRegisterContextType {
  currentCashRegister: CashRegister | null
  isOpen: boolean
  isLoading: boolean
  error: Error | null
  refreshCashRegister: () => Promise<void>
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({
  children,
  tenantId,
  branchId,
}: {
  children: ReactNode
  tenantId: string
  branchId: string
}) {
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const loadCashRegister = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Primero verificamos si hay una caja abierta
      const hasOpenRegister = await hasCashRegisterOpen(tenantId, branchId)
      setIsOpen(hasOpenRegister)

      if (hasOpenRegister) {
        // Si hay una caja abierta, la obtenemos
        const register = await getCurrentCashRegister(tenantId, branchId)
        setCurrentCashRegister(register)
      } else {
        setCurrentCashRegister(null)
      }
    } catch (err) {
      console.error("Error al cargar la caja:", err)
      setError(err instanceof Error ? err : new Error("Error desconocido al cargar la caja"))
      // No cambiamos el estado de isOpen o currentCashRegister en caso de error
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar la caja al montar el componente o cuando cambia el tenant o branch
  useEffect(() => {
    if (tenantId && branchId) {
      loadCashRegister()
    }
  }, [tenantId, branchId])

  const refreshCashRegister = async () => {
    await loadCashRegister()
  }

  return (
    <CashRegisterContext.Provider
      value={{
        currentCashRegister,
        isOpen,
        isLoading,
        error,
        refreshCashRegister,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  )
}

export function useCashRegister() {
  const context = useContext(CashRegisterContext)
  if (context === undefined) {
    throw new Error("useCashRegister debe ser usado dentro de un CashRegisterProvider")
  }
  return context
}
