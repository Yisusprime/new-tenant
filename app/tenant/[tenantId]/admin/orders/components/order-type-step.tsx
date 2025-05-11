"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Home, MapPin, Package, ShoppingBag, Utensils } from "lucide-react"
import type { OrderType } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"

interface OrderTypeStepProps {
  orderType: OrderType
  setOrderType: (type: OrderType) => void
  selectedTableId: string
  setSelectedTableId: (id: string) => void
  tables: Table[]
  deliveryStreet: string
  setDeliveryStreet: (street: string) => void
  deliveryNumber: string
  setDeliveryNumber: (number: string) => void
  deliveryCity: string
  setDeliveryCity: (city: string) => void
  deliveryZipCode: string
  setDeliveryZipCode: (zipCode: string) => void
  deliveryNotes: string
  setDeliveryNotes: (notes: string) => void
  errors: Record<string, string>
}

export function OrderTypeStep({
  orderType,
  setOrderType,
  selectedTableId,
  setSelectedTableId,
  tables,
  deliveryStreet,
  setDeliveryStreet,
  deliveryNumber,
  setDeliveryNumber,
  deliveryCity,
  setDeliveryCity,
  deliveryZipCode,
  setDeliveryZipCode,
  deliveryNotes,
  setDeliveryNotes,
  errors,
}: OrderTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="orderType" className="text-base font-medium flex items-center">
          <Package className="w-4 h-4 mr-2" />
          Tipo de Pedido <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
          <SelectTrigger id="orderType" className={errors.orderType ? "border-red-500" : ""}>
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
        {errors.orderType && <p className="text-red-500 text-sm">{errors.orderType}</p>}
      </div>

      {orderType === "table" && (
        <div className="space-y-2">
          <Label htmlFor="tableId" className="text-base font-medium flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Mesa <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={selectedTableId || "no-selection"}
            onValueChange={(value) => {
              console.log("Mesa seleccionada:", value)
              setSelectedTableId(value)
            }}
          >
            <SelectTrigger id="tableId" className={errors.tableId ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar mesa" />
            </SelectTrigger>
            <SelectContent>
              {tables.length === 0 ? (
                <SelectItem value="no-tables" disabled>
                  No hay mesas disponibles
                </SelectItem>
              ) : (
                tables
                  .filter((table) => !!table.id)
                  .map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Mesa {table.number} ({table.capacity} personas)
                    </SelectItem>
                  ))
              )}
              <SelectItem value="no-selection" disabled className="hidden">
                Seleccionar mesa
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.tableId && <p className="text-red-500 text-sm">{errors.tableId}</p>}
        </div>
      )}

      {orderType === "delivery" && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Dirección de Entrega
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryStreet" className="flex items-center">
                Calle <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="deliveryStreet"
                value={deliveryStreet}
                onChange={(e) => setDeliveryStreet(e.target.value)}
                placeholder="Ej: Av. Principal"
                className={errors.deliveryStreet ? "border-red-500" : ""}
              />
              {errors.deliveryStreet && <p className="text-red-500 text-sm">{errors.deliveryStreet}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNumber" className="flex items-center">
                Número <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="deliveryNumber"
                value={deliveryNumber}
                onChange={(e) => setDeliveryNumber(e.target.value)}
                placeholder="Ej: 123"
                className={errors.deliveryNumber ? "border-red-500" : ""}
              />
              {errors.deliveryNumber && <p className="text-red-500 text-sm">{errors.deliveryNumber}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryCity" className="flex items-center">
                Ciudad <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="deliveryCity"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="Ej: Buenos Aires"
                className={errors.deliveryCity ? "border-red-500" : ""}
              />
              {errors.deliveryCity && <p className="text-red-500 text-sm">{errors.deliveryCity}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryZipCode">
                Código Postal <span className="text-gray-500 text-xs">(Opcional)</span>
              </Label>
              <Input
                id="deliveryZipCode"
                value={deliveryZipCode}
                onChange={(e) => setDeliveryZipCode(e.target.value)}
                placeholder="Ej: 1000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryNotes">
              Notas de Entrega <span className="text-gray-500 text-xs">(Opcional)</span>
            </Label>
            <Textarea
              id="deliveryNotes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ej: Timbre 2B, edificio azul"
            />
          </div>
        </div>
      )}
    </div>
  )
}
