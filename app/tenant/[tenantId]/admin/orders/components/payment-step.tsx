"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CreditCard, Percent, Tag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
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
  // Nuevas propiedades
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
  // Nuevas propiedades
  cashRegisters,
  selectedCashRegisterId,
  setSelectedCashRegisterId,
}: PaymentStepProps) {
  const [showTipOptions, setShowTipOptions] = useState(false)
  const [showCouponOptions, setShowCouponOptions] = useState(false)

  // Seleccionar la primera caja por defecto si no hay ninguna seleccionada
  useEffect(() => {
    if (cashRegisters.length > 0 && !selectedCashRegisterId) {
      setSelectedCashRegisterId(cashRegisters[0].id)
    }
  }, [cashRegisters, selectedCashRegisterId, setSelectedCashRegisterId])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Información de Pago</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="paymentMethod" className="text-base font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Método de Pago <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod" className={errors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="app">App de Pago</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod}</p>}
          </div>

          {/* Selector de caja */}
          <div>
            <Label htmlFor="cashRegister">Caja</Label>
            <Select
              value={selectedCashRegisterId}
              onValueChange={setSelectedCashRegisterId}
              disabled={cashRegisters.length === 0}
            >
              <SelectTrigger id="cashRegister" className={errors.cashRegisterId ? "border-red-500" : ""}>
                <SelectValue placeholder={cashRegisters.length === 0 ? "No hay cajas abiertas" : "Seleccionar caja"} />
              </SelectTrigger>
              <SelectContent>
                {cashRegisters.map((register) => (
                  <SelectItem key={register.id} value={register.id}>
                    {register.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cashRegisterId && <p className="text-red-500 text-sm">{errors.cashRegisterId}</p>}
            {cashRegisters.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                No hay cajas abiertas. La venta no se registrará en ninguna caja.
              </p>
            )}
          </div>

          {/* Campos específicos para pago en efectivo */}
          {paymentMethod === "cash" && (
            <div className="space-y-4 border rounded-md p-3 bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="cashAmount" className="flex items-center">
                  Monto recibido <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="cashAmount"
                  type="number"
                  min={calculateTotal()}
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder={`Mínimo ${formatCurrency(calculateTotal())}`}
                  className={errors.cashAmount ? "border-red-500" : ""}
                />
                {errors.cashAmount && <p className="text-red-500 text-sm">{errors.cashAmount}</p>}
              </div>

              <div className="flex justify-between items-center font-medium">
                <span>Cambio a devolver:</span>
                <span className={changeAmount > 0 ? "text-green-600" : ""}>{formatCurrency(changeAmount)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        {/* Botón de propina */}
        <div className="flex-1">
          <Collapsible open={showTipOptions} onOpenChange={setShowTipOptions} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowTipOptions(!showTipOptions)}
              >
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2" />
                  Propina
                </div>
                {tipAmount > 0 && <Badge variant="secondary">{formatCurrency(tipAmount)}</Badge>}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={tipPercentage === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipPercentageChange(0)}
                >
                  Sin propina
                </Button>
                <Button
                  type="button"
                  variant={tipPercentage === 10 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipPercentageChange(10)}
                >
                  10%
                </Button>
                <Button
                  type="button"
                  variant={tipPercentage === 15 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipPercentageChange(15)}
                >
                  15%
                </Button>
                <Button
                  type="button"
                  variant={tipPercentage === 20 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTipPercentageChange(20)}
                >
                  20%
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="customTip">Monto:</Label>
                <Input
                  id="customTip"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tipAmount.toString()}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  className="w-24"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Botón de cupón */}
        <div className="flex-1">
          <Collapsible open={showCouponOptions} onOpenChange={setShowCouponOptions} className="border rounded-md">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowCouponOptions(!showCouponOptions)}
              >
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Cupón
                </div>
                {couponDiscount > 0 && <Badge variant="secondary">-{formatCurrency(couponDiscount)}</Badge>}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Código de cupón"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Aquí iría la lógica para validar el cupón
                    // Por ahora, simplemente aplicamos un descuento fijo de ejemplo
                    if (couponCode.trim()) {
                      setCouponDiscount(500) // $500 de descuento
                    }
                  }}
                >
                  Aplicar
                </Button>
              </div>
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Descuento aplicado:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  )
}
