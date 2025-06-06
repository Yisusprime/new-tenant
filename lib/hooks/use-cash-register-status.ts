"use client"

import { useState, useEffect } from "react"
import { getOpenCashRegisters } from "@/lib/services/cash-register-service"

export function useCashRegisterStatus(tenantId: string, branchId: string) {
  const [hasOpenCashRegister, setHasOpenCashRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId || !branchId) {
      setIsLoading(false)
      return
    }

    const checkCashRegisterStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const openRegisters = await getOpenCashRegisters(tenantId, branchId)
        setHasOpenCashRegister(openRegisters.length > 0)
      } catch (err) {
        console.error("Error checking cash register status:", err)
        setError("Error al verificar estado de cajas")
        setHasOpenCashRegister(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkCashRegisterStatus()

    // Verificar cada 30 segundos si hay cambios en las cajas
    const interval = setInterval(checkCashRegisterStatus, 30000)

    return () => clearInterval(interval)
  }, [tenantId, branchId])

  return {
    hasOpenCashRegister,
    isLoading,
    error,
  }
}
