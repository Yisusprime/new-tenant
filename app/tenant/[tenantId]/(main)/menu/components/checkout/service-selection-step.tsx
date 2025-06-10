"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Coffee, Truck, ShoppingBag } from "lucide-react"
import { useCheckout } from "../../context/checkout-context"
import type { ServiceType } from "../../context/checkout-context"

const SERVICE_OPTIONS = [
  {
    id: "dineIn" as ServiceType,
    title: "En el Local",
    description: "Consumir en el establecimiento",
    icon: Coffee,
  },
  {
    id: "delivery" as ServiceType,
    title: "Delivery",
    description: "Entrega a domicilio",
    icon: Truck,
  },
  {
    id: "takeout" as ServiceType,
    title: "Para Llevar",
    description: "Recoger en el local",
    icon: ShoppingBag,
  },
]

export function ServiceSelectionStep() {
  const { checkoutState, updateCheckoutState, availableServices } = useCheckout()

  const handleServiceChange = (serviceType: ServiceType) => {
    updateCheckoutState({
      serviceType,
      // Reset delivery address if not delivery
      deliveryAddress: serviceType === "delivery" ? checkoutState.deliveryAddress : null,
    })
  }

  const availableOptions = SERVICE_OPTIONS.filter((option) => availableServices.includes(option.id))

  if (availableOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay métodos de servicio disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecciona el tipo de servicio</h3>
        <p className="text-gray-600">¿Cómo te gustaría recibir tu pedido?</p>
      </div>

      <RadioGroup value={checkoutState.serviceType || ""} onValueChange={handleServiceChange} className="space-y-3">
        {availableOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-colors ${
                checkoutState.serviceType === option.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
              }`}
              onClick={() => handleServiceChange(option.id)}
            >
              <CardContent className="flex items-center space-x-4 p-4">
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="bg-primary/10 p-2 rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                    {option.title}
                  </Label>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </RadioGroup>
    </div>
  )
}
