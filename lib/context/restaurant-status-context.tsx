"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useCashRegisterStatus } from "@/lib/hooks/use-cash-register-status"
import { useBranch } from "@/lib/hooks/use-branch"
import { isRestaurantOpen } from "@/app/tenant/[tenantId]/(main)/menu/utils/restaurant-hours"

interface RestaurantStatusContextType {
  isOpen: boolean
  isWithinHours: boolean
  hasCashRegister: boolean
  isLoading: boolean
  canAcceptOrders: boolean
  statusMessage: string
}

const RestaurantStatusContext = createContext<RestaurantStatusContextType | undefined>(undefined)

interface RestaurantStatusProviderProps {
  children: ReactNode
  tenantId: string
  restaurantConfig: any
}

export function RestaurantStatusProvider({ children, tenantId, restaurantConfig }: RestaurantStatusProviderProps) {
  const [isWithinHours, setIsWithinHours] = useState(false)
  const { selectedBranch } = useBranch()
  const branchId = selectedBranch?.id || ""

  const { hasOpenCashRegister, isLoading: cashRegisterLoading } = useCashRegisterStatus(tenantId, branchId)

  useEffect(() => {
    if (restaurantConfig?.hours) {
      const open = isRestaurantOpen(restaurantConfig.hours.schedule)
      setIsWithinHours(open)
    }
  }, [restaurantConfig])

  // El restaurante puede aceptar pedidos solo si está dentro del horario Y tiene caja abierta
  const canAcceptOrders = isWithinHours && hasOpenCashRegister
  const isOpen = canAcceptOrders

  // Determinar el mensaje de estado
  const getStatusMessage = () => {
    if (cashRegisterLoading) {
      return "Verificando disponibilidad..."
    }

    if (!isWithinHours) {
      return "Cerrado por horario"
    }

    if (!hasOpenCashRegister) {
      return "Temporalmente no disponible"
    }

    return "Abierto ahora"
  }

  const value = {
    isOpen,
    isWithinHours,
    hasCashRegister: hasOpenCashRegister,
    isLoading: cashRegisterLoading,
    canAcceptOrders,
    statusMessage: getStatusMessage(),
  }

  return <RestaurantStatusContext.Provider value={value}>{children}</RestaurantStatusContext.Provider>
}

export function useRestaurantStatus() {
  const context = useContext(RestaurantStatusContext)
  if (context === undefined) {
    throw new Error("useRestaurantStatus must be used within a RestaurantStatusProvider")
  }
  return context
}
