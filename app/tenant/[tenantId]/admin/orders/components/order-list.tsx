"use client"

import { useState } from "react"
import { useOrders } from "@/lib/hooks/use-orders"
import { OrderStatus, OrderType } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface OrderListProps {
  type?: OrderType
  onViewDetails: (orderId: string) => void
}

export function OrderList({ type, onViewDetails }: OrderListProps) {
  const { orders, loading, error, loadAllOrders, loadOrdersByType } = useOrders()
  const [activeType, setActiveType] = useState<OrderType | null>(type || null)

  // Función para cambiar el tipo de pedido
  const handleTypeChange = async (newType: OrderType | null) => {
    setActiveType(newType)

    if (newType) {
      await loadOrdersByType(newType)
    } else {
      await loadAllOrders()
    }
  }

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "warning"
      case OrderStatus.IN_PROGRESS:
        return "default"
      case OrderStatus.COMPLETED:
        return "success"
      case OrderStatus.CANCELLED:
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Función para obtener el texto del tipo de pedido
  const getOrderTypeText = (type: OrderType) => {
    switch (type) {
      case OrderType.DINE_IN:
        return "Local"
      case OrderType.TAKEAWAY:
        return "Para llevar"
      case OrderType.DELIVERY:
        return "Delivery"
      default:
        return type
    }
  }

  // Función para obtener el texto del estado del pedido
  const getOrderStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Pendiente"
      case OrderStatus.IN_PROGRESS:
        return "En preparación"
      case OrderStatus.COMPLETED:
        return "Completado"
      case OrderStatus.CANCELLED:
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant={activeType === null ? "default" : "outline"} onClick={() => handleTypeChange(null)}>
          Todos
        </Button>
        <Button
          variant={activeType === OrderType.DINE_IN ? "default" : "outline"}
          onClick={() => handleTypeChange(OrderType.DINE_IN)}
        >
          Local
        </Button>
        <Button
          variant={activeType === OrderType.TAKEAWAY ? "default" : "outline"}
          onClick={() => handleTypeChange(OrderType.TAKEAWAY)}
        >
          Para llevar
        </Button>
        <Button
          variant={activeType === OrderType.DELIVERY ? "default" : "outline"}
          onClick={() => handleTypeChange(OrderType.DELIVERY)}
        >
          Delivery
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-destructive-foreground underline ml-2"
              onClick={() => (activeType ? handleTypeChange(activeType) : loadAllOrders())}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">
            No hay pedidos {activeType ? `de tipo ${getOrderTypeText(activeType)}` : ""}
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getOrderTypeText(order.type)}</Badge>
                  </TableCell>
                  <TableCell>{order.customerName || "Anónimo"}</TableCell>
                  <TableCell>{formatCurrency(order.total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>{getOrderStatusText(order.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    {order.createdAt?.toDate
                      ? new Date(order.createdAt.toDate()).toLocaleString()
                      : new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(order.id)}>
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
