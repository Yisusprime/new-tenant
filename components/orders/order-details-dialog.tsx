"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types/orders"
import { formatCurrency } from "@/lib/utils"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-500 text-white" },
      preparing: { label: "Preparando", className: "bg-blue-500 text-white" },
      ready: { label: "Listo", className: "bg-green-500 text-white" },
      delivered: { label: "Entregado", className: "bg-purple-500 text-white" },
      completed: { label: "Completado", className: "bg-green-700 text-white" },
      cancelled: { label: "Cancelado", className: "bg-red-500 text-white" },
    }

    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const paymentConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      paid: { label: "Pagado", className: "bg-green-100 text-green-800 border-green-200" },
      partially_paid: { label: "Pago Parcial", className: "bg-blue-100 text-blue-800 border-blue-200" },
      refunded: { label: "Reembolsado", className: "bg-red-100 text-red-800 border-red-200" },
    }

    return (
      <Badge variant="outline" className={paymentConfig[status].className}>
        {paymentConfig[status].label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.orderNumber}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
          <DialogDescription>Creado el {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del cliente */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Información del cliente</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Nombre:</div>
              <div>{order.customerName || "N/A"}</div>

              <div className="font-medium">Teléfono:</div>
              <div>{order.customerPhone || "N/A"}</div>

              {order.type === "delivery" && (
                <>
                  <div className="font-medium">Dirección:</div>
                  <div>{order.customerAddress || "N/A"}</div>
                </>
              )}

              <div className="font-medium">Tipo de pedido:</div>
              <div className="capitalize">
                {order.type === "dine-in"
                  ? "Para comer aquí"
                  : order.type === "takeaway"
                    ? "Para llevar"
                    : order.type === "delivery"
                      ? "Entrega a domicilio"
                      : order.type === "table"
                        ? `Mesa ${order.tableId}`
                        : order.type}
              </div>
            </div>
          </div>

          <Separator />

          {/* Productos */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">
                      {item.quantity}x {item.productName}
                    </div>
                    {item.extras.length > 0 && (
                      <ul className="text-xs text-muted-foreground ml-4">
                        {item.extras.map((extra) => (
                          <li key={extra.id}>
                            {extra.quantity}x {extra.name} ({formatCurrency(extra.price)})
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.notes && <div className="text-xs text-muted-foreground ml-4 italic">Nota: {item.notes}</div>}
                  </div>
                  <div className="text-right">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Resumen de pago */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Resumen de pago</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              {order.couponDiscount && order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Cupón ({order.couponCode}):</span>
                  <span>-{formatCurrency(order.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Impuestos:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>

              {order.deliveryFee && order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Costo de entrega:</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}

              {order.tip > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Propina:</span>
                  <span>{formatCurrency(order.tip)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">Estado de pago:</span>
                <span>{getPaymentBadge(order.paymentStatus)}</span>
              </div>

              {order.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span>Método de pago:</span>
                  <span className="capitalize">
                    {order.paymentMethod === "cash"
                      ? "Efectivo"
                      : order.paymentMethod === "card"
                        ? "Tarjeta"
                        : order.paymentMethod === "transfer"
                          ? "Transferencia"
                          : order.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {order.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Notas del pedido</h3>
              <div className="text-sm bg-gray-50 p-3 rounded-md">{order.notes}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
