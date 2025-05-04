"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Check, X, AlertCircle, Truck, Coffee, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Order, OrderStatus } from "@/lib/types/orders"
import { useOrderContext } from "./order-context"

interface OrderCardProps {
  order: Order
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const { updateOrderStatus, completeOrder, cancelOrder } = useOrderContext()

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <Coffee className="h-4 w-4" />
      case "ready":
        return <AlertCircle className="h-4 w-4" />
      case "delivered":
        return <Truck className="h-4 w-4" />
      case "completed":
        return <Check className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
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

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "ready":
        return "bg-green-500"
      case "delivered":
        return "bg-purple-500"
      case "completed":
        return "bg-green-700"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "dine-in":
        return "Para consumir"
      case "takeaway":
        return "Para llevar"
      case "delivery":
        return "Delivery"
      case "table":
        return "Mesa"
      default:
        return type
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error("Error al cambiar el estado:", error)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder(orderId)
    } catch (error) {
      console.error("Error al completar el pedido:", error)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId)
    } catch (error) {
      console.error("Error al cancelar el pedido:", error)
    }
  }

  // Renderizar botones de acción según el estado actual
  const renderActionButtons = () => {
    switch (order.status) {
      case "pending":
        return (
          <>
            <Button size="sm" onClick={() => handleStatusChange(order.id, "preparing")}>
              Preparar
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleCancelOrder(order.id)}>
              Cancelar
            </Button>
          </>
        )
      case "preparing":
        return (
          <Button size="sm" className="w-full" onClick={() => handleStatusChange(order.id, "ready")}>
            Marcar como Listo
          </Button>
        )
      case "ready":
        return (
          <Button size="sm" className="w-full" onClick={() => handleStatusChange(order.id, "delivered")}>
            Marcar como Entregado
          </Button>
        )
      case "delivered":
        return (
          <Button size="sm" className="w-full" onClick={() => handleCompleteOrder(order.id)}>
            Completar Pedido
          </Button>
        )
      case "completed":
        return (
          <div className="flex items-center text-sm text-gray-500 w-full justify-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            <span>Pedido completado</span>
          </div>
        )
      case "cancelled":
        return (
          <div className="flex items-center text-sm text-gray-500 w-full justify-center">
            <X className="h-4 w-4 mr-1 text-red-500" />
            <span>Pedido cancelado</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card key={order.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">#{order.orderNumber}</h3>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{getStatusText(order.status)}</span>
              </Badge>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {order.createdAt &&
                formatDistanceToNow(new Date(order.createdAt.toDate ? order.createdAt.toDate() : order.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
            </div>
            <div className="flex items-center text-sm mt-1">
              <Badge variant="outline">{getTypeText(order.type)}</Badge>
              {order.tableId && <span className="ml-2">Mesa: {order.tableId}</span>}
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

        {order.customerName && (
          <div className="mt-4 flex items-center text-sm">
            <User className="h-4 w-4 mr-1" />
            <span>{order.customerName}</span>
            {order.customerPhone && <span className="ml-2">({order.customerPhone})</span>}
          </div>
        )}

        <div className="mt-4 flex justify-between">{renderActionButtons()}</div>
      </CardContent>
    </Card>
  )
}
