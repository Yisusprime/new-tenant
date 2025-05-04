"use client"
import { useOrderContext } from "./order-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { MapPin, Phone, Clock, CheckCircle, Truck } from "lucide-react"

export const DeliveryList = () => {
  const { orders, loading, error, updateOrderStatus, completeOrder } = useOrderContext()

  // Filtrar solo pedidos de delivery que no estén completados o cancelados
  const deliveryOrders = orders.filter(
    (order) => order.type === "delivery" && order.status !== "completed" && order.status !== "cancelled",
  )

  if (loading) {
    return <div className="flex justify-center p-8">Cargando pedidos de delivery...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "preparing":
        return <Badge className="bg-blue-500">Preparando</Badge>
      case "ready":
        return <Badge className="bg-green-500">Listo para enviar</Badge>
      case "delivered":
        return <Badge className="bg-purple-500">En camino</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pedidos de Delivery</h2>

      {deliveryOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay pedidos de delivery activos</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveryOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">#{order.orderNumber}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${order.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{order.items.length} items</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-sm text-gray-500 text-center">+{order.items.length - 3} más...</div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{order.customerAddress}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                  {order.deliveryNotes && <div className="text-gray-600 italic">"{order.deliveryNotes}"</div>}
                </div>

                <div className="mt-4 flex justify-between">
                  {order.status === "pending" && (
                    <Button size="sm" className="w-full" onClick={() => updateOrderStatus(order.id, "preparing")}>
                      Preparar
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button size="sm" className="w-full" onClick={() => updateOrderStatus(order.id, "ready")}>
                      Listo para enviar
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button size="sm" className="w-full" onClick={() => updateOrderStatus(order.id, "delivered")}>
                      <Truck className="mr-2 h-4 w-4" />
                      Enviar
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Button size="sm" className="w-full" onClick={() => completeOrder(order.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Entregado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
