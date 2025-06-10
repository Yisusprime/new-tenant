"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Clock, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import type { RestaurantConfig } from "@/lib/services/restaurant-config-service"
import { useBranch } from "@/lib/context/branch-context"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
  cartItems: any[]
  totalPrice: number
  onOrderComplete: () => void
}

type ServiceType = "dineIn" | "delivery" | "takeout"
type PaymentMethod = "cash" | "credit_card" | "debit_card" | "transfer"

export function Checkout({ isOpen, onClose, cartItems, totalPrice, onOrderComplete }: CheckoutProps) {
  const params = useParams()
  const tenantId = params.tenantId as string
  const { currentBranch } = useBranch()
  const { toast } = useToast()

  // Estados del checkout
  const [step, setStep] = useState(1)
  const [serviceType, setServiceType] = useState<ServiceType | "">("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [needsChange, setNeedsChange] = useState<boolean | null>(null)
  const [changeAmount, setChangeAmount] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  // Configuración del restaurante
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar configuración del restaurante
  useEffect(() => {
    async function loadConfig() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId, currentBranch.id)
        setRestaurantConfig(config)
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración del restaurante",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadConfig()
    }
  }, [isOpen, tenantId, currentBranch, toast])

  // Obtener métodos de pago disponibles
  const getAvailablePaymentMethods = () => {
    if (!restaurantConfig?.paymentMethods) return []

    return restaurantConfig.paymentMethods.methods
      .filter((method) => method.isActive)
      .map((method) => ({
        id: method.id,
        name: method.name,
        icon: getPaymentIcon(method.id),
      }))
  }

  const getPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case "cash":
        return Banknote
      case "credit_card":
      case "debit_card":
        return CreditCard
      case "transfer":
        return Smartphone
      default:
        return CreditCard
    }
  }

  const getAvailableServices = () => {
    if (!restaurantConfig?.serviceMethods) return []

    const services = []
    if (restaurantConfig.serviceMethods.dineIn) {
      services.push({ id: "dineIn", name: "En el Local", icon: Building2 })
    }
    if (restaurantConfig.serviceMethods.delivery) {
      services.push({ id: "delivery", name: "Delivery", icon: MapPin })
    }
    if (restaurantConfig.serviceMethods.takeout) {
      services.push({ id: "takeout", name: "Para Llevar", icon: Clock })
    }
    return services
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    )
  }

  if (!restaurantConfig && !loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Error de Configuración</h3>
          <p className="text-gray-600 mb-4">No se pudo cargar la configuración del restaurante</p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    )
  }

  const availableServices = getAvailableServices()
  const availablePaymentMethods = getAvailablePaymentMethods()
}
