"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentCashRegister } from "@/lib/services/cash-register-service"
import type { CashRegister } from "@/lib/types/cash-register"
import { useAuth } from "./auth-context"

interface CashRegisterContextType {
  currentCashRegister: CashRegister | null
  isOpen: boolean
  loading: boolean
  error: string | null
  refreshCashRegister: () => Promise<void>
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined)

export function CashRegisterProvider({
  children,
  tenantId,
  branchId,
}: {
  children: React.ReactNode
  tenantId: string
  branchId?: string
}) {
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchCashRegister = async () => {
    if (!branchId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Verificar si hay una caja abierta
      const cashRegister = await getCurrentCashRegister(tenantId, branchId)
      setCurrentCashRegister(cashRegister)
      setIsOpen(cashRegister !== null)
    } catch (err) {
      console.error("Error al cargar la caja:", err)
      setError("Error al cargar la información de la caja")
    } finally {
      setLoading(false)
    }
  }

  // Cargar la caja al montar el componente o cuando cambia la sucursal
  useEffect(() => {
    fetchCashRegister()
  }, [tenantId, branchId, user])

  const refreshCashRegister = async () => {
    await fetchCashRegister()
  }

  return (
    <CashRegisterContext.Provider
      value={{
        currentCashRegister,
        isOpen,
        loading,
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
