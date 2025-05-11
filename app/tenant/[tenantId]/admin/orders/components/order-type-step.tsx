"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, MapPin, Package, ShoppingBag, Utensils } from "lucide-react"
import type { OrderType } from "@/lib/types/order"

interface OrderTypesStepProps {
  selectedType: OrderType
  onTypeChange: (type: OrderType) => void
  tenantId: string
  branchId: string
}

export function OrderTypesStep({ selectedType, onTypeChange, tenantId, branchId }: OrderTypesStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orderType" className="text-base font-medium flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Tipo de Pedido
        </Label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger id="orderType">
            <SelectValue placeholder="Seleccionar tipo de pedido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local">
              <div className="flex items-center">
                <Utensils className="w-4 h-4 mr-2" />
                Consumo en Local
              </div>
            </SelectItem>
            <SelectItem value="takeaway">
              <div className="flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Para Llevar
              </div>
            </SelectItem>
            <SelectItem value="table">
              <div className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Mesa
              </div>
            </SelectItem>
            <SelectItem value="delivery">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Delivery
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
