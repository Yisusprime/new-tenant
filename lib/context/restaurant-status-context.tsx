"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useCashRegisterStatus } from "@/lib/hooks/use-cash-register-status"
import { useBranch } from "@/lib/hooks/use-branch"
import { isRestaurantOpen, getRestaurantStatusInfo } from "@/app/tenant/[tenantId]/(main)/menu/utils/restaurant-hours"

interface RestaurantStatusContextType {
  isOpen: boolean
  isWithinHours: boolean
  hasCashRegister: boolean
  isLoading: boolean
  canAcceptOrders: boolean
  statusMessage: string
  debugInfo?: any
}

const RestaurantStatusContext = createContext<RestaurantStatusContextType | undefined>(undefined)

interface RestaurantStatusProviderProps {
  children: ReactNode
  tenantId: string
  restaurantConfig: any
}

export function RestaurantStatusProvider({ children, tenantId, restaurantConfig }: RestaurantStatusProviderProps) {
  const [isWithinHours, setIsWithinHours] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const { selectedBranch } = useBranch()
  const branchId = selectedBranch?.id || ""

  const { hasOpenCashRegister, isLoading: cashRegisterLoading } = useCashRegisterStatus(tenantId, branchId)

  useEffect(() => {
    if (restaurantConfig?.hours?.schedule) {
      console.log("=== VERIFICANDO HORARIOS DEL RESTAURANTE ===")
      console.log("Configuración de horarios:", restaurantConfig.hours)

      const statusInfo = getRestaurantStatusInfo(restaurantConfig.hours.schedule)
      console.log("Información de estado:", statusInfo)

      const open = isRestaurantOpen(restaurantConfig.hours.schedule)
      console.log("¿Está abierto por horarios?", open)

      setIsWithinHours(open)
      setDebugInfo(statusInfo)
    } else {
      console.log("No hay configuración de horarios disponible")
      console.log("restaurantConfig:", restaurantConfig)
      setIsWithinHours(false)
      setDebugInfo({ reason: "No hay configuración de horarios" })
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
    debugInfo,
  }

  // Log para debugging
  console.log("=== ESTADO FINAL DEL RESTAURANTE ===")
  console.log("isWithinHours:", isWithinHours)
  console.log("hasOpenCashRegister:", hasOpenCashRegister)
  console.log("canAcceptOrders:", canAcceptOrders)
  console.log("statusMessage:", getStatusMessage())
  console.log("debugInfo:", debugInfo)

  return <RestaurantStatusContext.Provider value={value}>{children}</RestaurantStatusContext.Provider>
}

export function useRestaurantStatus() {
  const context = useContext(RestaurantStatusContext)
  if (context === undefined) {
    throw new Error("useRestaurantStatus must be used within a RestaurantStatusProvider")
  }
  return context
}
