"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, User, CreditCard, Clock } from "lucide-react"
import { useCheckout } from "../../context/checkout-context"
import { useCart } from "../../context/cart-context"
import { formatCurrency } from "@/lib/utils"

interface OrderSummaryStepProps {
  onPlaceOrder: () => void
  isProcessing: boolean
}

export function OrderSummaryStep({ onPlaceOrder, isProcessing }: OrderSummaryStepProps) {
  const { checkoutState, availablePaymentMethods } = useCheckout()
  const { items, total } = useCart()

  const getServiceTypeLabel = () => {
    switch (checkoutState.serviceType) {
      case "dineIn":
        return "En el local"
      case "delivery":
        return "Delivery"
      case "takeout":
        return "Para llevar"
      default:
        return ""
    }
  }

  const getPaymentMethodLabel = () => {
    return availablePaymentMethods.find((p) => p.id === checkoutState.paymentMethod)?.name || ""
  }

  const calculateChange = () => {
    if (!checkoutState.needsChange || !checkoutState.cashAmount) return 0
    const cashValue = Number.parseFloat(checkoutState.cashAmount) || 0
    return Math.max(0, cashValue - total)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirmar pedido</h3>
        <p className="text-gray-600">Revisa todos los detalles antes de confirmar</p>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{item.quantity}x</Badge>
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.extras && item.extras.length > 0 && (
                  <div className="text-sm text-gray-600 ml-8">
                    Extras: {item.extras.map((extra) => extra.name).join(", ")}
                  </div>
                )}
              </div>
              <span className="font-medium">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Información del servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Tipo de servicio:</span>
            <span className="font-medium">{getServiceTypeLabel()}</span>
          </div>

          {checkoutState.serviceType === "delivery" && checkoutState.deliveryAddress && (
            <div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <p className="font-medium">Dirección de entrega:</p>
                  <p className="text-sm text-gray-600">
                    {checkoutState.deliveryAddress.street} {checkoutState.deliveryAddress.number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {checkoutState.deliveryAddress.city}
                    {checkoutState.deliveryAddress.zipCode && `, ${checkoutState.deliveryAddress.zipCode}`}
                  </p>
                  {checkoutState.deliveryAddress.notes && (
                    <p className="text-sm text-gray-500 italic">{checkoutState.deliveryAddress.notes}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="w-4 h-4 mr-2" />
            Información del cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Nombre:</span>
            <span className="font-medium">{checkoutState.customerInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Teléfono:</span>
            <span className="font-medium">{checkoutState.customerInfo.phone}</span>
          </div>
          {checkoutState.customerInfo.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{checkoutState.customerInfo.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Información de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Método de pago:</span>
            <span className="font-medium">{getPaymentMethodLabel()}</span>
          </div>

          {checkoutState.paymentMethod === "cash" && (
            <>
              {checkoutState.needsChange ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto a pagar:</span>
                    <span className="font-medium">
                      {formatCurrency(Number.parseFloat(checkoutState.cashAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vuelto:</span>
                    <span className="font-medium text-green-600">{formatCurrency(calculateChange())}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pago exacto:</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Procesando pedido...
          </>
        ) : (
          `Confirmar pedido - ${formatCurrency(total)}`
        )}
      </Button>
    </div>
  )
}
