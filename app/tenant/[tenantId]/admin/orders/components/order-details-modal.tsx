"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Phone, User } from "lucide-react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"

interface OrderDetailsModalProps {
  order: Order
  open: boolean
  onClose: () => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export default function OrderDetailsModal({ order, open, onClose, onStatusChange }: OrderDetailsModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status)

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "default"
      case "received":
        return "secondary"
      case "preparing":
        return "warning"
      case "ready":
        return "success"
      case "on_the_way":
        return "info"
      case "delivered":
        return "success"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "received":
        return "Recibido"
      case "preparing":
        return "En preparación"
      case "ready":
        return "Listo"
      case "on_the_way":
        return "En camino"
      case "delivered":
        return "Entregado"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case "dine_in":
        return "Mesa"
      case "takeaway":
        return "Para llevar"
      case "delivery":
        return "Delivery"
      default:
        return type
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "paid":
        return "Pagado"
      case "refunded":
        return "Reembolsado"
      default:
        return status
    }
  }

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return "No especificado"

    switch (method) {
      case "cash":
        return "Efectivo"
      case "card":
        return "Tarjeta"
      case "transfer":
        return "Transferencia"
      case "other":
        return "Otro"
      default:
        return method
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleStatusChange = () => {
    if (status !== order.status) {
      onStatusChange(order.id, status)
      onClose()
    }
  }

  const getAvailableStatuses = (): OrderStatus[] => {
    const allStatuses: OrderStatus[] = ["pending", "received", "preparing", "ready"]

    if (order.orderType === "delivery") {
      allStatuses.push("on_the_way", "delivered")
    }

    allStatuses.push("completed", "cancelled")

    return allStatuses
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Pedido #{order.orderNumber}</span>
            <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
            <Badge variant="outline">{getOrderTypeLabel(order.orderType)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Información del Cliente</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customerName}</span>
              </div>

              {order.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customerPhone}</span>
                </div>
              )}

              {order.customerEmail && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{order.customerEmail}</span>
                </div>
              )}

              {order.orderType === "dine_in" && order.tableNumber && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Mesa {order.tableNumber}</span>
                </div>
              )}

              {order.orderType === "delivery" && order.deliveryAddress && (
                <div className="flex items-center gap-2 flex-wrap">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {order.deliveryAddress.street} {order.deliveryAddress.number}, {order.deliveryAddress.city}
                    {order.deliveryAddress.zipCode && `, ${order.deliveryAddress.zipCode}`}
                  </span>
                  {order.deliveryAddress.notes && (
                    <div className="w-full pl-6 text-sm text-muted-foreground">
                      Notas: {order.deliveryAddress.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium mt-4 mb-2">Información del Pedido</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Creado: {formatDate(order.createdAt)}</span>
              </div>

              {order.estimatedReadyTime && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Listo aprox:</span>
                  <span>{formatDate(order.estimatedReadyTime)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Pago:</span>
                <Badge variant="outline">{getPaymentStatusLabel(order.paymentStatus)}</Badge>
                {order.paymentMethod && <Badge variant="outline">{getPaymentMethodLabel(order.paymentMethod)}</Badge>}
              </div>

              {order.notes && (
                <div>
                  <span className="text-muted-foreground">Notas:</span>
                  <p className="mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Productos</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">
                      {item.quantity}x {item.productName}
                    </div>
                    <div>{formatCurrency(item.totalPrice)}</div>
                  </div>

                  {item.extras && item.extras.length > 0 && (
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground">Extras:</span>
                      <div className="text-sm pl-2">
                        {item.extras.map((extra) => (
                          <div key={extra.id} className="flex justify-between">
                            <span>{extra.name}</span>
                            <span>{formatCurrency(extra.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && <div className="mt-1 text-sm text-muted-foreground">Notas: {item.notes}</div>}
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}

              {order.deliveryFee && order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Costo de envío</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}

              {order.discount && order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <Separator className="my-2" />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Cambiar estado:</span>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableStatuses().map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>
                    {getStatusLabel(statusOption)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={handleStatusChange} disabled={status === order.status}>
              Guardar cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
