"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Clock, MapPin, MoreVertical, Phone, User } from "lucide-react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
import OrderDetailsModal from "./order-details-modal"

interface OrderCardProps {
  order: Order
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

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

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case "pending":
        return ["received", "cancelled"]
      case "received":
        return ["preparing", "cancelled"]
      case "preparing":
        return ["ready", "cancelled"]
      case "ready":
        return order.orderType === "delivery" ? ["on_the_way"] : ["completed", "cancelled"]
      case "on_the_way":
        return ["delivered", "cancelled"]
      case "delivered":
        return ["completed"]
      case "completed":
        return []
      case "cancelled":
        return []
      default:
        return []
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

  const nextStatuses = getNextStatuses(order.status)

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>Pedido #{order.orderNumber}</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
                <Badge variant="outline">{getOrderTypeLabel(order.orderType)}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">{formatDate(order.createdAt)}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDetailsOpen(true)}>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Imprimir ticket</DropdownMenuItem>
                {order.status !== "cancelled" && (
                  <DropdownMenuItem className="text-destructive" onClick={() => onStatusChange(order.id, "cancelled")}>
                    Cancelar pedido
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-col gap-2">
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

            {order.orderType === "dine_in" && order.tableNumber && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Mesa {order.tableNumber}</span>
              </div>
            )}

            {order.orderType === "delivery" && order.deliveryAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {order.deliveryAddress.street} {order.deliveryAddress.number}, {order.deliveryAddress.city}
                </span>
              </div>
            )}

            {order.estimatedReadyTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Listo aprox. {formatDate(order.estimatedReadyTime)}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted-foreground mb-2">
              {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
            </div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span>{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-sm text-muted-foreground">Y {order.items.length - 3} productos más...</div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="font-bold">Total: {formatCurrency(order.total)}</div>

          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.length === 1 ? (
                <Button
                  onClick={() => onStatusChange(order.id, nextStatuses[0])}
                  variant={nextStatuses[0] === "cancelled" ? "destructive" : "default"}
                  size="sm"
                >
                  {getStatusLabel(nextStatuses[0])}
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Cambiar estado <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {nextStatuses.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusChange(order.id, status)}
                        className={status === "cancelled" ? "text-destructive" : ""}
                      >
                        {getStatusLabel(status)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </CardFooter>
      </Card>

      <OrderDetailsModal
        order={order}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onStatusChange={onStatusChange}
      />
    </>
  )
}
