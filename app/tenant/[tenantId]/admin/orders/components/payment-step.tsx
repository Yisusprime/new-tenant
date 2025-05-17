"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { CashRegister } from "@/lib/types/cash-register"

interface PaymentStepProps {
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  tipAmount: number
  setTipAmount: (amount: number) => void
  tipPercentage: number
  setTipPercentage: (percentage: number) => void
  couponCode: string
  setCouponCode: (code: string) => void
  couponDiscount: number
  setCouponDiscount: (discount: number) => void
  cashAmount: string
  setCashAmount: (amount: string) => void
  changeAmount: number
  calculateTotal: () => number
  handleTipPercentageChange: (percentage: number) => void
  handleCustomTipChange: (value: string) => void
  errors: Record<string, string>
  currencyCode: string
  // Nuevas propiedades para cajas
  cashRegisters: CashRegister[]
  selectedCashRegisterId: string
  setSelectedCashRegisterId: (id: string) => void
}

export function PaymentStep({
  paymentMethod,
  setPaymentMethod,
  tipAmount,
  setTipAmount,
  tipPercentage,
  setTipPercentage,
  couponCode,
  setCouponCode,
  couponDiscount,
  setCouponDiscount,
  cashAmount,
  setCashAmount,
  changeAmount,
  calculateTotal,
  handleTipPercentageChange,
  handleCustomTipChange,
  errors,
  currencyCode,
  // Nuevas propiedades para cajas
  cashRegisters,
  selectedCashRegisterId,
  setSelectedCashRegisterId,
}: PaymentStepProps) {
  const [customTip, setCustomTip] = useState<string>("")

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value)
  }

  const handleCouponDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value) || 0
    setCouponDiscount(value)
  }

  const handleCashAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCashAmount(e.target.value)
  }

  const handleCustomTipInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomTip(value)
    handleCustomTipChange(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">Método de Pago</h2>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash">Efectivo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">Tarjeta</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer">Transferencia</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="app" id="app" />
            <Label htmlFor="app">App de Pago</Label>
          </div>
        </RadioGroup>
        {errors.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>}
      </div>

      {/* Sección de Caja */}
      <div>
        <h2 className="text-lg font-medium mb-4">Caja</h2>
        {cashRegisters.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No hay cajas abiertas. La venta no se registrará en ninguna caja.</AlertDescription>
          </Alert>
        ) : (
          <div>
            <Label htmlFor="cashRegister">Seleccionar Caja</Label>
            <Select value={selectedCashRegisterId} onValueChange={setSelectedCashRegisterId}>
              <SelectTrigger id="cashRegister">
                <SelectValue placeholder="Seleccionar caja" />
              </SelectTrigger>
              <SelectContent>
                {cashRegisters.map((register) => (
                  <SelectItem key={register.id} value={register.id}>
                    {register.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cashRegisterId && <p className="text-sm text-red-500 mt-1">{errors.cashRegisterId}</p>}
          </div>
        )}
      </div>

      {paymentMethod === "cash" && (
        <div>
          <h2 className="text-lg font-medium mb-4">Detalles del Pago en Efectivo</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cashAmount">Monto Recibido</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencyCode}</span>
                <Input
                  id="cashAmount"
                  type="number"
                  value={cashAmount}
                  onChange={handleCashAmountChange}
                  className="pl-12"
                  min={0}
                />
              </div>
              {errors.cashAmount && <p className="text-sm text-red-500 mt-1">{errors.cashAmount}</p>}
            </div>
            <div>
              <Label htmlFor="changeAmount">Cambio a Devolver</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencyCode}</span>
                <Input
                  id="changeAmount"
                  type="text"
                  value={formatCurrency(changeAmount, currencyCode)}
                  readOnly
                  className="pl-12 bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-4">Propina</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={tipPercentage === 0 ? "default" : "outline"}
              onClick={() => handleTipPercentageChange(0)}
              className="flex-1"
            >
              Sin propina
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 5 ? "default" : "outline"}
              onClick={() => handleTipPercentageChange(5)}
              className="flex-1"
            >
              5%
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 10 ? "default" : "outline"}
              onClick={() => handleTipPercentageChange(10)}
              className="flex-1"
            >
              10%
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 15 ? "default" : "outline"}
              onClick={() => handleTipPercentageChange(15)}
              className="flex-1"
            >
              15%
            </Button>
          </div>
          <div>
            <Label htmlFor="customTip">Propina Personalizada</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencyCode}</span>
              <Input
                id="customTip"
                type="number"
                value={customTip}
                onChange={handleCustomTipInputChange}
                className="pl-12"
                min={0}
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span>Propina:</span>
                <span>{formatCurrency(tipAmount, currencyCode)}</span>
              </div>
              {tipPercentage > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  {tipPercentage}% del subtotal ({formatCurrency(calculateTotal() - tipAmount, currencyCode)})
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-4">Cupón de Descuento</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="couponCode">Código de Cupón</Label>
            <Input id="couponCode" value={couponCode} onChange={handleCouponChange} />
          </div>
          <div>
            <Label htmlFor="couponDiscount">Monto de Descuento</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencyCode}</span>
              <Input
                id="couponDiscount"
                type="number"
                value={couponDiscount}
                onChange={handleCouponDiscountChange}
                className="pl-12"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
