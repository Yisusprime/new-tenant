"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, User } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { OrderType } from "@/lib/types/order"

interface CustomerInfoStepProps {
  orderType: OrderType
  customerName: string
  setCustomerName: (name: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  customerEmail: string
  setCustomerEmail: (email: string) => void
  errors: Record<string, string>
}

export function CustomerInfoStep({
  orderType,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  errors,
}: CustomerInfoStepProps) {
  const [showOptionalFields, setShowOptionalFields] = useState(false)

  // Determinar qué campos son obligatorios según el tipo de pedido
  const isPhoneRequired = orderType === "delivery"

  return (
    <div className="space-y-6">
      <h3 className="font-medium flex items-center">
        <User className="w-4 h-4 mr-2" />
        Información del Cliente
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="flex items-center">
            Nombre <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className={errors.customerName ? "border-red-500" : ""}
          />
          {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
        </div>

        {/* Campos opcionales colapsables */}
        <Collapsible
          open={showOptionalFields || isPhoneRequired}
          onOpenChange={setShowOptionalFields}
          className="border rounded-md p-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              {isPhoneRequired ? "Información adicional" : "Información adicional (opcional)"}
            </h4>
            {!isPhoneRequired && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                  {showOptionalFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>

          <CollapsibleContent className="pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="flex items-center">
                Teléfono {isPhoneRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                className={errors.customerPhone ? "border-red-500" : ""}
              />
              {errors.customerPhone && <p className="text-red-500 text-sm">{errors.customerPhone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                Email <span className="text-gray-500 text-xs">(Opcional)</span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Ej: cliente@ejemplo.com"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
