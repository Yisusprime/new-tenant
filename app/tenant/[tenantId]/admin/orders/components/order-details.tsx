"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, Printer, ArrowLeft } from "lucide-react"

interface OrderDetailsProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>
}

export function OrderDetails({ order, isOpen, onClose, onUpdateStatus }: OrderDetailsProps) {
  const [loading, setLoading] = useState(false)

  if (!order) return null

  // Función para obtener el tipo de pedido en español
  const getOrderType = (type: string) => {
    const typeMap: Record<string, string> = {
      dine_in: "Local",
      takeaway: "Para llevar",
      table: "Mesa",
      delivery: "Delivery",
    }
    return typeMap[type] || type
  }

  // Función para obtener el estado del pedido en español
  const getOrderStatus = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { label: string; variant: string }> = {
      pending: { label: "Pendiente", variant: "default" },
      preparing: { label: "Preparando", variant: "warning" },
      ready: { label: "Listo", variant: "success" },
      delivered: { label: "Entregado", variant: "success" },
      completed: { label: "Completado", variant: "success" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }
    return statusMap[status]
  }

  // Función para obtener el método de pago en español
  const getPaymentMethod = (method?: string) => {
    if (!method) return "No especificado"

    const methodMap: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      other: "Otro",
    }
    return methodMap[method] || method
  }

  // Función para obtener el estado del pago en español
  const getPaymentStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string }> = {
      pending: { label: "Pendiente", variant: "warning" },
      paid: { label: "Pagado", variant: "success" },
      refunded: { label: "Reembolsado", variant: "default" },
    }
    return statusMap[status] || { label: status, variant: "default" }
  }

  const handleUpdateStatus = async (status: OrderStatus) => {
    setLoading(true)
    try {
      await onUpdateStatus(order.id, status)
      onClose()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const status = getOrderStatus(order.status)
  const paymentStatus = getPaymentStatus(order.paymentStatus)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pedido #{order.orderNumber}</span>
            <Badge variant={status.variant as any}>{status.label}</Badge>
          </DialogTitle>
          <DialogDescription>Creado el {formatDate(order.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <h3 className="font-semibold mb-2">Información del Cliente</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Nombre:</span> {order.customer.name}
              </p>
              {order.customer.phone && (
                <p>
                  <span className="font-medium">Teléfono:</span> {order.customer.phone}
                </p>
              )}
              {order.customer.email && (
                <p>
                  <span className="font-medium">Email:</span> {order.customer.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Detalles del Pedido</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Tipo:</span> {getOrderType(order.type)}
                {order.type === "table" && order.tableInfo && (
                  <span className="ml-1">(Mesa {order.tableInfo.name})</span>
                )}
              </p>
              <p>
                <span className="font-medium">Estado de pago:</span>{" "}
                <Badge variant={paymentStatus.variant as any}>{paymentStatus.label}</Badge>
              </p>
              <p>
                <span className="font-medium">Método de pago:</span> {getPaymentMethod(order.paymentMethod)}
              </p>
            </div>
          </div>

          {order.type === "delivery" && order.customer.address && (
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-semibold mb-2">Dirección de Entrega</h3>
              <div className="space-y-1 text-sm">
                <p>
                  {order.customer.address.street} {order.customer.address.number}
                </p>
                {order.customer.address.apartment && <p>Apto/Oficina: {order.customer.address.apartment}</p>}
                <p>
                  {order.customer.address.city}
                  {order.customer.address.state && `, ${order.customer.address.state}`}
                  {order.customer.address.zipCode && ` ${order.customer.address.zipCode}`}
                </p>
                {order.customer.address.instructions && (
                  <p>
                    <span className="font-medium">Instrucciones:</span> {order.customer.address.instructions}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Productos</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.notes && <div className="text-xs text-muted-foreground">Nota: {item.notes}</div>}
                      {item.extras && item.extras.length > 0 && (
                        <ul className="text-xs text-muted-foreground mt-1">
                          {item.extras.map((extra, index) => (
                            <li key={index}>
                              + {extra.name} ({extra.quantity}) - {formatCurrency(extra.price * extra.quantity)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Impuestos:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
          )}
          {order.deliveryFee && order.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Costo de envío:</span>
              <span>{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {order.discount && order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Notas adicionales</h3>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center mt-6">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
          <div className="flex gap-2">
            {order.status !== "cancelled" && (
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={loading || order.status === "completed"}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Pedido
              </Button>
            )}
            {order.status !== "completed" && order.status !== "cancelled" && (
              <Button onClick={() => handleUpdateStatus("completed")} disabled={loading}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar Pedido
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
