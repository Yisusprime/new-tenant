"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useBranch } from "@/lib/context/branch-context"
import { getOrder, updateOrderStatus, deleteOrder } from "@/lib/services/order-service"
import type { Order, OrderStatus } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
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
import { ArrowLeft, Loader2, Printer } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { PrintTicketDialog } from "@/components/print-ticket-dialog"
import { usePrintTicket } from "@/lib/hooks/use-print-ticket"

export default function OrderDetailsPage({ params }: { params: { tenantId: string; orderId: string } }) {
  const { tenantId, orderId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { isPrintDialogOpen, setIsPrintDialogOpen, restaurantInfo } = usePrintTicket(tenantId, currentBranch?.id || "")

  useEffect(() => {
    if (currentBranch) {
      loadOrder()
    }
  }, [tenantId, orderId, currentBranch])

  const loadOrder = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      const orderData = await getOrder(tenantId, currentBranch.id, orderId)
      setOrder(orderData)
    } catch (error) {
      console.error("Error al cargar pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: OrderStatus) => {
    if (!currentBranch || !order) return

    try {
      setActionLoading(true)
      await updateOrderStatus(tenantId, currentBranch.id, orderId, status)
      loadOrder()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!currentBranch) return

    try {
      setActionLoading(true)
      await deleteOrder(tenantId, currentBranch.id, orderId)
      setDeleteDialogOpen(false)
      router.push(`/tenant/${tenantId}/admin/orders`)
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
    } finally {
      setActionLoading(false)
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

  if (!currentBranch) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Selecciona una sucursal para ver los detalles del pedido</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">No se encontró el pedido</p>
        <Button variant="outline" onClick={() => router.push(`/tenant/${tenantId}/admin/orders`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Pedidos
        </Button>
      </div>
    )
  }

  // Verificar si el IVA está activado en el pedido
  const isTaxEnabled = order.taxEnabled !== undefined ? order.taxEnabled : true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/tenant/${tenantId}/admin/orders`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Pedido {order.orderNumber}</h1>
        </div>
        <div className="flex items-center gap-2">
          {getOrderTypeBadge(order.type)}
          {getStatusBadge(order.status)}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Pedido</CardTitle>
          <CardDescription>Creado el {formatDate(order.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div>
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

          <div>
            <div className="flex justify-between items-center">
              <span>{isTaxEnabled && order.taxIncluded ? "Subtotal (IVA incluido)" : "Subtotal"}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {/* Solo mostrar el IVA si está activado Y no está incluido en los precios */}
            {isTaxEnabled && !order.taxIncluded && order.tax > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span>Impuestos</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}

            {order.tip > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span>Propina</span>
                <span>{formatCurrency(order.tip)}</span>
              </div>
            )}

            {order.coupon && order.coupon.discount > 0 && (
              <div className="flex justify-between items-center mt-2 text-green-600">
                <span>Descuento</span>
                <span>-{formatCurrency(order.coupon.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4 font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar Pedido
              </Button>
              <Button variant="outline" onClick={() => setIsPrintDialogOpen(true)}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Ticket
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusChange("cancelled")}
                disabled={actionLoading || order.status === "cancelled"}
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
                disabled={actionLoading || order.status === "delivered" || order.status === "cancelled"}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {order.status === "pending" && "Iniciar Preparación"}
                {order.status === "preparing" && "Marcar como Listo"}
                {order.status === "ready" && "Marcar como Entregado"}
                {(order.status === "delivered" || order.status === "cancelled") && "Completado"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <PrintTicketDialog
        order={order}
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        restaurantName={restaurantInfo.name}
        restaurantAddress={restaurantInfo.address}
        restaurantPhone={restaurantInfo.phone}
        restaurantLogo={restaurantInfo.logo}
      />
    </div>
  )
}
