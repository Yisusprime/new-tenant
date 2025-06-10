"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useCheckout } from "../../context/checkout-context"

export function CustomerInfoStep() {
  const { checkoutState, updateCheckoutState } = useCheckout()

  const updateCustomerInfo = (field: string, value: string) => {
    updateCheckoutState({
      customerInfo: {
        ...checkoutState.customerInfo,
        [field]: value,
      },
    })
  }

  const updateDeliveryAddress = (field: string, value: string) => {
    updateCheckoutState({
      deliveryAddress: {
        ...checkoutState.deliveryAddress,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Información de contacto</h3>
        <p className="text-gray-600">Necesitamos estos datos para procesar tu pedido</p>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">
                Nombre completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={checkoutState.customerInfo.name}
                onChange={(e) => updateCustomerInfo("name", e.target.value)}
                placeholder="Tu nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">
                Teléfono <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                value={checkoutState.customerInfo.phone}
                onChange={(e) => updateCustomerInfo("phone", e.target.value)}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerEmail">Email (opcional)</Label>
            <Input
              id="customerEmail"
              type="email"
              value={checkoutState.customerInfo.email || ""}
              onChange={(e) => updateCustomerInfo("email", e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address (only if delivery is selected) */}
      {checkoutState.serviceType === "delivery" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Dirección de entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">
                  Calle <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={checkoutState.deliveryAddress?.street || ""}
                  onChange={(e) => updateDeliveryAddress("street", e.target.value)}
                  placeholder="Nombre de la calle"
                  required
                />
              </div>
              <div>
                <Label htmlFor="number">
                  Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number"
                  value={checkoutState.deliveryAddress?.number || ""}
                  onChange={(e) => updateDeliveryAddress("number", e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">
                  Ciudad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={checkoutState.deliveryAddress?.city || ""}
                  onChange={(e) => updateDeliveryAddress("city", e.target.value)}
                  placeholder="Santiago"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Código postal (opcional)</Label>
                <Input
                  id="zipCode"
                  value={checkoutState.deliveryAddress?.zipCode || ""}
                  onChange={(e) => updateDeliveryAddress("zipCode", e.target.value)}
                  placeholder="8320000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                value={checkoutState.deliveryAddress?.notes || ""}
                onChange={(e) => updateDeliveryAddress("notes", e.target.value)}
                placeholder="Departamento, referencias, instrucciones especiales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
