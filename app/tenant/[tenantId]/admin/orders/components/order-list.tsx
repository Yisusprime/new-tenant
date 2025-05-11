"use client"
import type { OrderSummary, OrderStatus } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
// Actualizar la importación de formatCurrency
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface OrderListProps {
  orders: OrderSummary[]
  onViewOrder: (orderId: string) => void
  onEditOrder: (orderId: string) => void
  onDeleteOrder: (orderId: string) => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
}

export function OrderList({ orders, onViewOrder, onEditOrder, onDeleteOrder, onUpdateStatus }: OrderListProps) {
  const router = useRouter()

  // Función para formatear la fecha
  // const formatDate = (date: Date) => {
  //   return new Intl.DateTimeFormat("es-ES", {
  //     day: "2-digit",
  //     month: "2-digit",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   }).format(date)
  // }

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", variant: "default" },
      preparing: { label: "Preparando", variant: "warning" },
      ready: { label: "Listo", variant: "success" },
      delivered: { label: "Entregado", variant: "success" },
      completed: { label: "Completado", variant: "success" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No hay pedidos para mostrar
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {getOrderType(order.type)}
                  {order.type === "table" && order.tableInfo && (
                    <span className="ml-1 text-xs text-muted-foreground">(Mesa {order.tableInfo.name})</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewOrder(order.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditOrder(order.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={order.status === "completed" || order.status === "cancelled"}
                        onClick={() => onUpdateStatus(order.id, "completed")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como completado
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={order.status === "cancelled"}
                        onClick={() => onUpdateStatus(order.id, "cancelled")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar pedido
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
