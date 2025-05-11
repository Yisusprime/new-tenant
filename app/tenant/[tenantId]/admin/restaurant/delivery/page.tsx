"use client"

import type React from "react"

import { useState } from "react"
import type { RestaurantDeliverySettings } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock, DollarSign } from "lucide-react"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { useBranch } from "@/lib/context/branch-context"

export default function RestaurantDeliveryPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { currentBranch } = useBranch()

  // Usar nuestro hook personalizado para cargar los datos
  const {
    data: deliverySettings,
    setData: setDeliverySettings,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantDeliverySettings>(tenantId, "deliverySettings", {
    estimatedTime: "30-45",
    minOrderForFreeDelivery: 0,
    deliveryCost: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Asegurarse de que los valores numéricos sean números
      const updatedSettings = {
        ...deliverySettings,
        minOrderForFreeDelivery: Number(deliverySettings.minOrderForFreeDelivery),
        deliveryCost: Number(deliverySettings.deliveryCost),
      }
      setDeliverySettings(updatedSettings)

      // Usar el nuevo método saveData
      const success = await saveData()

      if (success) {
        // Marcar este paso como completado
        saveCompleted("delivery")
      }
    } catch (error) {
      console.error("Error al guardar configuraciones de delivery:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <RestaurantConfigSteps tenantId={tenantId} currentStep="delivery">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="delivery">
      <div className="max-w-md space-y-6">
        <form id="delivery-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedTime" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Tiempo Estimado de Entrega (minutos)
              </Label>
              <Input
                id="estimatedTime"
                value={deliverySettings.estimatedTime}
                onChange={(e) => setDeliverySettings({ ...deliverySettings, estimatedTime: e.target.value })}
                placeholder="Ej: 30-45"
              />
              <p className="text-xs text-gray-500">
                Tiempo aproximado que tarda en llegar un pedido (ej: "30-45" o "20")
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryCost" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Costo Base de Delivery
              </Label>
              <Input
                id="deliveryCost"
                type="number"
                min="0"
                step="0.01"
                value={deliverySettings.deliveryCost}
                onChange={(e) =>
                  setDeliverySettings({ ...deliverySettings, deliveryCost: Number.parseFloat(e.target.value) })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">Costo base de envío (sin considerar zonas específicas)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderForFreeDelivery" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Mínimo para Delivery Gratuito
              </Label>
              <Input
                id="minOrderForFreeDelivery"
                type="number"
                min="0"
                step="0.01"
                value={deliverySettings.minOrderForFreeDelivery}
                onChange={(e) =>
                  setDeliverySettings({
                    ...deliverySettings,
                    minOrderForFreeDelivery: Number.parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                Monto mínimo de compra para obtener delivery gratuito (0 = sin delivery gratuito)
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Configuración de Delivery
          </Button>
        </form>
      </div>
    </RestaurantConfigSteps>
  )
}
