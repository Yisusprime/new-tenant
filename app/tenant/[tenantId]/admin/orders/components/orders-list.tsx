"use client"

import { useState } from "react"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { updateOrderStatus } from "@/lib/services/order-service"
import { OrderDetailsDialog } from "./order-details-dialog"

interface OrdersListProps {
  orders: Order[]
  tenantId: string
  branchId: string
  onStatusChange: () => void
}

export function OrdersList({ orders, tenantId, branchId, onStatusChange }: OrdersListProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(tenantId, branchId, orderId, status)
      onStatusChange()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      preparing: { label: "En preparación", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      ready: { label: "Listo", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800 hover:bg-red-200" },
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

  if (orders.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay pedidos disponibles</div>
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{getOrderTypeBadge(order.type)}</TableCell>
              <TableCell>
                {order.customerName || (order.type === "table" ? `Mesa ${order.tableNumber}` : "Cliente")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0">
                      {getStatusBadge(order.status)}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, "pending")}>
                      Pendiente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, "preparing")}>
                      En preparación
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, "ready")}>Listo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, "delivered")}>
                      Entregado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(order.id, "cancelled")}>
                      Cancelado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          tenantId={tenantId}
          branchId={branchId}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}
