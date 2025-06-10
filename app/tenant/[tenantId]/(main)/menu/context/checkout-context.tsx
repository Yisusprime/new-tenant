"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import type { RestaurantConfig } from "@/lib/services/restaurant-config-service"

export type ServiceType = "dineIn" | "delivery" | "takeout"
export type PaymentMethodType = "cash" | "card" | "transfer" | "app"

interface DeliveryAddress {
  street: string
  number: string
  city: string
  zipCode?: string
  notes?: string
}

interface CheckoutState {
  serviceType: ServiceType | null
  paymentMethod: PaymentMethodType | null
  customerInfo: {
    name: string
    phone: string
    email?: string
  }
  deliveryAddress: DeliveryAddress | null
  needsChange: boolean
  cashAmount: string
  notes: string
}

interface CheckoutContextType {
  checkoutState: CheckoutState
  updateCheckoutState: (updates: Partial<CheckoutState>) => void
  resetCheckout: () => void
  restaurantConfig: RestaurantConfig | null
  availableServices: ServiceType[]
  availablePaymentMethods: Array<{ id: string; name: string }>
  isLoading: boolean
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

const initialState: CheckoutState = {
  serviceType: null,
  paymentMethod: null,
  customerInfo: {
    name: "",
    phone: "",
    email: "",
  },
  deliveryAddress: null,
  needsChange: false,
  cashAmount: "",
  notes: "",
}

interface CheckoutProviderProps {
  children: ReactNode
  tenantId: string
  branchId: string
}

export function CheckoutProvider({ children, tenantId, branchId }: CheckoutProviderProps) {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(initialState)
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true)
        const config = await getRestaurantConfig(tenantId, branchId)
        setRestaurantConfig(config)
      } catch (error) {
        console.error("Error loading restaurant config:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (tenantId && branchId) {
      loadConfig()
    }
  }, [tenantId, branchId])

  const updateCheckoutState = (updates: Partial<CheckoutState>) => {
    setCheckoutState((prev) => ({ ...prev, ...updates }))
  }

  const resetCheckout = () => {
    setCheckoutState(initialState)
  }

  // Determinar servicios disponibles basado en la configuración
  const availableServices: ServiceType[] = []
  if (restaurantConfig?.serviceMethods) {
    if (restaurantConfig.serviceMethods.dineIn) availableServices.push("dineIn")
    if (restaurantConfig.serviceMethods.delivery) availableServices.push("delivery")
    if (restaurantConfig.serviceMethods.takeout) availableServices.push("takeout")
  }

  // Determinar métodos de pago disponibles
  const availablePaymentMethods =
    restaurantConfig?.paymentMethods?.methods
      ?.filter((method) => method.isActive)
      ?.map((method) => ({ id: method.id, name: method.name })) || []

  return (
    <CheckoutContext.Provider
      value={{
        checkoutState,
        updateCheckoutState,
        resetCheckout,
        restaurantConfig,
        availableServices,
        availablePaymentMethods,
        isLoading,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider")
  }
  return context
}
