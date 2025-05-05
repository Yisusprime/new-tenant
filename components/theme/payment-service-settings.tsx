"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Wallet, ShoppingBag, Home, Truck } from "lucide-react"

interface PaymentServiceSettingsProps {
  tenantData: any
  handleSwitchChange: (name: string, checked: boolean) => void
  handleNestedSwitchChange: (parent: string, name: string, checked: boolean) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function PaymentServiceSettings({
  tenantData,
  handleSwitchChange,
  handleNestedSwitchChange,
  handleInputChange,
}: PaymentServiceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pago y Servicio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Métodos de Pago Aceptados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="acceptsCash"
                checked={tenantData.paymentMethods?.acceptsCash !== false}
                onCheckedChange={(checked) => handleNestedSwitchChange("paymentMethods", "acceptsCash", checked)}
              />
              <Label htmlFor="acceptsCash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Efectivo
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptsCard"
                checked={tenantData.paymentMethods?.acceptsCard !== false}
                onCheckedChange={(checked) => handleNestedSwitchChange("paymentMethods", "acceptsCard", checked)}
              />
              <Label htmlFor="acceptsCard" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Tarjeta de Crédito/Débito
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptsTransfer"
                checked={tenantData.paymentMethods?.acceptsTransfer === true}
                onCheckedChange={(checked) => handleNestedSwitchChange("paymentMethods", "acceptsTransfer", checked)}
              />
              <Label htmlFor="acceptsTransfer" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Transferencia Bancaria
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="acceptsOnlinePayment"
                checked={tenantData.paymentMethods?.acceptsOnlinePayment === true}
                onCheckedChange={(checked) =>
                  handleNestedSwitchChange("paymentMethods", "acceptsOnlinePayment", checked)
                }
              />
              <Label htmlFor="acceptsOnlinePayment" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Pago en Línea
              </Label>
            </div>
          </div>

          {tenantData.paymentMethods?.acceptsOnlinePayment && (
            <div className="mt-4 pl-6 border-l-2 border-gray-200">
              <div className="grid gap-2">
                <Label htmlFor="onlinePaymentInstructions">Instrucciones para Pago en Línea</Label>
                <Input
                  id="onlinePaymentInstructions"
                  name="paymentMethods.onlinePaymentInstructions"
                  value={tenantData.paymentMethods?.onlinePaymentInstructions || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: Enlace de pago, instrucciones específicas, etc."
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Opciones de Servicio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="offersPickup"
                checked={tenantData.serviceOptions?.offersPickup !== false}
                onCheckedChange={(checked) => handleNestedSwitchChange("serviceOptions", "offersPickup", checked)}
              />
              <Label htmlFor="offersPickup" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Retiro en Local
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="offersTakeaway"
                checked={tenantData.serviceOptions?.offersTakeaway !== false}
                onCheckedChange={(checked) => handleNestedSwitchChange("serviceOptions", "offersTakeaway", checked)}
              />
              <Label htmlFor="offersTakeaway" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Para Llevar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="offersDelivery"
                checked={tenantData.serviceOptions?.offersDelivery === true}
                onCheckedChange={(checked) => handleNestedSwitchChange("serviceOptions", "offersDelivery", checked)}
              />
              <Label htmlFor="offersDelivery" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Domicilio
              </Label>
            </div>
          </div>

          {tenantData.serviceOptions?.offersDelivery && (
            <div className="mt-4 space-y-4 pl-6 border-l-2 border-gray-200">
              <div className="grid gap-2">
                <Label htmlFor="deliveryRadius">Radio de Entrega (km)</Label>
                <Input
                  id="deliveryRadius"
                  name="serviceOptions.deliveryRadius"
                  type="number"
                  min="0"
                  step="0.1"
                  value={tenantData.serviceOptions?.deliveryRadius || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: 5"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deliveryFee">Costo de Envío ($)</Label>
                <Input
                  id="deliveryFee"
                  name="serviceOptions.deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tenantData.serviceOptions?.deliveryFee || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: 2.50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="freeDeliveryThreshold">Monto Mínimo para Envío Gratis ($)</Label>
                <Input
                  id="freeDeliveryThreshold"
                  name="serviceOptions.freeDeliveryThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tenantData.serviceOptions?.freeDeliveryThreshold || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: 20.00"
                />
                <p className="text-xs text-muted-foreground">
                  Deja en blanco o en 0 si no ofreces envío gratis por monto mínimo
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estimatedDeliveryTime">Tiempo Estimado de Entrega (minutos)</Label>
                <Input
                  id="estimatedDeliveryTime"
                  name="serviceOptions.estimatedDeliveryTime"
                  type="number"
                  min="0"
                  value={tenantData.serviceOptions?.estimatedDeliveryTime || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: 30"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
