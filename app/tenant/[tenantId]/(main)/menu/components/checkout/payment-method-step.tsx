"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Banknote, Smartphone, ArrowRightLeft } from "lucide-react"
import { useCheckout } from "../../context/checkout-context"
import { useCart } from "../../context/cart-context"
import { formatCurrency } from "@/lib/utils"
import type { PaymentMethodType } from "../../context/checkout-context"

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowRightLeft,
  app: Smartphone,
}

export function PaymentMethodStep() {
  const { checkoutState, updateCheckoutState, availablePaymentMethods } = useCheckout()
  const { total } = useCart()

  const handlePaymentMethodChange = (paymentMethod: PaymentMethodType) => {
    updateCheckoutState({
      paymentMethod,
      // Reset cash-specific fields when changing payment method
      needsChange: paymentMethod === "cash" ? checkoutState.needsChange : false,
      cashAmount: paymentMethod === "cash" ? checkoutState.cashAmount : "",
    })
  }

  const handleNeedsChangeToggle = (needsChange: boolean) => {
    updateCheckoutState({
      needsChange,
      cashAmount: needsChange ? checkoutState.cashAmount : "",
    })
  }

  const handleCashAmountChange = (cashAmount: string) => {
    updateCheckoutState({ cashAmount })
  }

  const calculateChange = () => {
    if (!checkoutState.needsChange || !checkoutState.cashAmount) return 0
    const cashValue = Number.parseFloat(checkoutState.cashAmount) || 0
    return Math.max(0, cashValue - total)
  }

  if (availablePaymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay métodos de pago disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Método de pago</h3>
        <p className="text-gray-600">Selecciona cómo quieres pagar tu pedido</p>
      </div>

      <RadioGroup
        value={checkoutState.paymentMethod || ""}
        onValueChange={handlePaymentMethodChange}
        className="space-y-3"
      >
        {availablePaymentMethods.map((method) => {
          const Icon = PAYMENT_ICONS[method.id as keyof typeof PAYMENT_ICONS] || CreditCard
          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-colors ${
                checkoutState.paymentMethod === method.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
              }`}
              onClick={() => handlePaymentMethodChange(method.id as PaymentMethodType)}
            >
              <CardContent className="flex items-center space-x-4 p-4">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="bg-primary/10 p-2 rounded-full">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor={method.id} className="text-base font-medium cursor-pointer">
                    {method.name}
                  </Label>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </RadioGroup>

      {/* Cash Payment Options */}
      {checkoutState.paymentMethod === "cash" && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="needsChange" className="text-base font-medium">
                  ¿Necesitas vuelto?
                </Label>
                <p className="text-sm text-gray-600">Activa esta opción si pagarás con un monto mayor al total</p>
              </div>
              <Switch id="needsChange" checked={checkoutState.needsChange} onCheckedChange={handleNeedsChangeToggle} />
            </div>

            {checkoutState.needsChange && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cashAmount">
                    Monto con el que pagarás <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cashAmount"
                    type="number"
                    min={total}
                    step="100"
                    value={checkoutState.cashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value)}
                    placeholder={`Mínimo ${formatCurrency(total)}`}
                  />
                </div>

                {checkoutState.cashAmount && Number.parseFloat(checkoutState.cashAmount) >= total && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Vuelto a entregar:</span>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(calculateChange())}</span>
                    </div>
                  </div>
                )}

                {checkoutState.cashAmount && Number.parseFloat(checkoutState.cashAmount) < total && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">El monto debe ser igual o mayor al total del pedido</p>
                  </div>
                )}
              </div>
            )}

            {!checkoutState.needsChange && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-600">
                  Pagarás exactamente <strong>{formatCurrency(total)}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
