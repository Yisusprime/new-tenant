import type { OrderStatus } from "@/lib/services/order-service"
import { Badge } from "@/components/ui/badge"
import { cva } from "class-variance-authority"

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      received: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      preparing: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      ready: "bg-green-100 text-green-800 hover:bg-green-100",
      in_transit: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      delivered: "bg-teal-100 text-teal-800 hover:bg-teal-100",
      completed: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  },
  defaultVariants: {
    status: "new",
  },
})

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap: Record<OrderStatus, string> = {
      new: "Nuevo",
      received: "Recibido",
      preparing: "En preparación",
      ready: "Listo",
      in_transit: "En camino",
      delivered: "Entregado",
      completed: "Completado",
      cancelled: "Cancelado",
    }
    return statusMap[status] || status
  }

  return (
    <Badge variant="outline" className={statusBadgeVariants({ status })}>
      {getStatusLabel(status)}
    </Badge>
  )
}
