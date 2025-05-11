import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import type { OrderItem, OrderType } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"

interface OrderSummaryProps {
  orderType: OrderType
  items: OrderItem[]
  customerName: string
  paymentMethod: string
  selectedTableId: string
  tables: Table[]
  cashAmount: string
  changeAmount: number
  tipAmount: number
  tipPercentage: number
  couponDiscount: number
  calculateSubtotal: () => number
  calculateTotal: () => number
  taxIncluded: boolean
  taxAmount: number
  taxRate: number
  currencyCode: string
}

export function OrderSummary({
  orderType,
  items,
  customerName,
  paymentMethod,
  selectedTableId,
  tables,
  cashAmount,
  changeAmount,
  tipAmount,
  tipPercentage,
  couponDiscount,
  calculateSubtotal,
  calculateTotal,
  taxIncluded,
  taxAmount,
  taxRate,
  currencyCode,
}: OrderSummaryProps) {
  const subtotal = calculateSubtotal()
  const total = calculateTotal()

  // Función para formatear la moneda con el código correcto
  const formatMoney = (amount: number) => {
    return formatCurrency(amount, currencyCode)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tipo de pedido:</span>
            <Badge variant="outline">
              {orderType === "local" && "Consumo en Local"}
              {orderType === "takeaway" && "Para Llevar"}
              {orderType === "table" && "Mesa"}
              {orderType === "delivery" && "Delivery"}
            </Badge>
          </div>

          {orderType === "table" && selectedTableId && (
            <div className="flex justify-between text-sm">
              <span>Mesa:</span>
              <span>{tables.find((t) => t.id === selectedTableId)?.number || ""}</span>
            </div>
          )}

          {customerName && (
            <div className="flex justify-between text-sm">
              <span>Cliente:</span>
              <span>{customerName}</span>
            </div>
          )}

          {paymentMethod && (
            <div className="flex justify-between text-sm">
              <span>Método de pago:</span>
              <span>
                {paymentMethod === "cash" && "Efectivo"}
                {paymentMethod === "card" && "Tarjeta"}
                {paymentMethod === "transfer" && "Transferencia"}
                {paymentMethod === "app" && "App de Pago"}
              </span>
            </div>
          )}

          {paymentMethod === "cash" && Number.parseFloat(cashAmount) > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span>Monto recibido:</span>
                <span>{formatMoney(Number.parseFloat(cashAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cambio:</span>
                <span>{formatMoney(changeAmount)}</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Productos:</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{taxIncluded ? "Subtotal (IVA incluido):" : "Subtotal:"}</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          {!taxIncluded && taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>IVA ({(taxRate * 100).toFixed(0)}%):</span>
              <span>{formatMoney(taxAmount)}</span>
            </div>
          )}

          {tipAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Propina ({tipPercentage}%):</span>
              <span>{formatMoney(tipAmount)}</span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento:</span>
              <span>-{formatMoney(couponDiscount)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full text-lg font-bold">
          <span>Total:</span>
          <span>{formatMoney(total)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
