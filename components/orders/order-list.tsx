"use client"

import { useState, useEffect } from "react"
import { useOrderContext } from "./order-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Clock, Check, X, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export const OrderList = () => {
  const { orders, loading, error, fetchOrders } = useOrderContext()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = statusFilter ? orders.filter((order) => order.status === statusFilter) : orders

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendiente
          </Badge>
        )
      case "preparing":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Preparando
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Listo
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Entregado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine-in":
        return <ShoppingBag className="h-4 w-4 text-blue-500" />
      case "takeaway":
        return <ShoppingBag className="h-4 w-4 text-green-500" />
      case "delivery":
        return <ShoppingBag className="h-4 w-4 text-purple-500" />
      case "table":
        return <ShoppingBag className="h-4 w-4 text-orange-500" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>Error al cargar los pedidos. Por favor, intenta de nuevo.</p>
          <Button onClick={() => fetchOrders()} variant="outline" size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No hay pedidos {statusFilter ? `con estado ${statusFilter}` : ""}</h3>
        <p className="text-sm text-muted-foreground mt-1">Los pedidos aparecerán aquí cuando se creen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(null)}>
          Todos
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("pending")}
        >
          Pendientes
        </Button>
        <Button
          variant={statusFilter === "preparing" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("preparing")}
        >
          Preparando
        </Button>
        <Button
          variant={statusFilter === "ready" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("ready")}
        >
          Listos
        </Button>
        <Button
          variant={statusFilter === "delivered" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("delivered")}
        >
          Entregados
        </Button>
        <Button
          variant={statusFilter === "cancelled" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("cancelled")}
        >
          Cancelados
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getOrderTypeIcon(order.type)}
                  <span className="font-medium">Pedido #{order.orderNumber}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <span className="font-medium">{item.quantity}x</span> {item.productName}
                        {item.extras.length > 0 && (
                          <div className="text-sm text-muted-foreground pl-5">
                            {item.extras.map((extra) => (
                              <div key={extra.id}>
                                {extra.quantity}x {extra.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        $
                        {(
                          item.price * item.quantity +
                          item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos:</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento:</span>
                      <span>-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.tip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Propina:</span>
                      <span>${order.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-1">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {order.customerName && (
                    <div className="text-sm bg-muted px-2 py-1 rounded-md">Cliente: {order.customerName}</div>
                  )}
                  {order.customerPhone && (
                    <div className="text-sm bg-muted px-2 py-1 rounded-md">Tel: {order.customerPhone}</div>
                  )}
                  {order.tableId && <div className="text-sm bg-muted px-2 py-1 rounded-md">Mesa: {order.tableId}</div>}
                  {order.customerAddress && (
                    <div className="text-sm bg-muted px-2 py-1 rounded-md">Dirección: {order.customerAddress}</div>
                  )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Detalles
                  </Button>
                  {order.status === "pending" && (
                    <>
                      <Button variant="default" size="sm">
                        <Check className="mr-1 h-4 w-4" />
                        Aceptar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <X className="mr-1 h-4 w-4" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
