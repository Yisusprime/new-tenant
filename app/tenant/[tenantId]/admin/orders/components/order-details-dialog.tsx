"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Order, OrderStatus } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
import { updateOrderStatus, deleteOrder } from "@/lib/services/order-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onStatusChange: () => void
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  tenantId,
  branchId,
  onStatusChange,
}: OrderDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      setLoading(true)
      await updateOrderStatus(tenantId, branchId, order.id, status)
      onStatusChange()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    try {
      setLoading(true)
      await deleteOrder(tenantId, branchId, order.id)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onStatusChange()
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      preparing: { label: "En preparación", className: "bg-blue-100 text-blue-800" },
      ready: { label: "Listo", className: "bg-green-100 text-green-800" },
      delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getOrderTypeBadge = (type: string) => {
    const typeConfig = {
      local: { label: "Local", className: "bg-purple-100 text-purple-800" },
      takeaway: { label: "Para llevar", className: "bg-indigo-100 text-indigo-800" },
      table: { label: "Mesa", className: "bg-blue-100 text-blue-800" },
      delivery: { label: "Delivery", className: "bg-green-100 text-green-800" },
    }

    const config = typeConfig[type as keyof typeof typeConfig]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido {order.orderNumber}</span>
              <div className="flex items-center gap-2">
                {getOrderTypeBadge(order.type)}
                {getStatusBadge(order.status)}
              </div>
            </DialogTitle>
            <DialogDescription>Creado el {formatDate(order.createdAt)}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h3 className="font-medium mb-2">Información del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Nombre:</span> {order.customerName || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span> {order.customerPhone || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.customerEmail || "No especificado"}
                </p>

                {order.type === "table" && (
                  <p>
                    <span className="font-medium">Mesa:</span> {order.tableNumber}
                  </p>
                )}

                {order.type === "delivery" && order.deliveryAddress && (
                  <div>
                    <p className="font-medium">Dirección de entrega:</p>
                    <p>
                      {order.deliveryAddress.street} {order.deliveryAddress.number}
                    </p>
                    <p>
                      {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
                    </p>
                    {order.deliveryAddress.notes && <p>Notas: {order.deliveryAddress.notes}</p>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Información del Pago</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Método de pago:</span> {order.paymentMethod || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Estado del pago:</span>{" "}
                  <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
                    {order.paymentStatus === "paid"
                      ? "Pagado"
                      : order.paymentStatus === "failed"
                        ? "Fallido"
                        : "Pendiente"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="py-4">
            <h3 className="font-medium mb-4">Artículos del Pedido</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                    {item.extras && item.extras.length > 0 && (
                      <div className="text-sm text-gray-500 ml-4">
                        <p className="font-medium">Extras:</p>
                        <ul className="list-disc list-inside">
                          {item.extras.map((extra, i) => (
                            <li key={i}>
                              {extra.name} ({formatCurrency(extra.price)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.notes && <p className="text-sm text-gray-500 mt-1">Nota: {item.notes}</p>}
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="py-4">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>Impuestos</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-4 font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={loading}>
              Eliminar Pedido
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusChange("cancelled")}
                disabled={loading || order.status === "cancelled"}
              >
                Cancelar Pedido
              </Button>
              <Button
                onClick={() => {
                  const nextStatus: Record<OrderStatus, OrderStatus> = {
                    pending: "preparing",
                    preparing: "ready",
                    ready: "delivered",
                    delivered: "delivered",
                    cancelled: "cancelled",
                  }
                  handleStatusChange(nextStatus[order.status])
                }}
                disabled={loading || order.status === "delivered" || order.status === "cancelled"}
              >
                {order.status === "pending" && "Iniciar Preparación"}
                {order.status === "preparing" && "Marcar como Listo"}
                {order.status === "ready" && "Marcar como Entregado"}
                {(order.status === "delivered" || order.status === "cancelled") && "Completado"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido {order.orderNumber} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
