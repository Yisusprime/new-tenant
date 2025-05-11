import type { OrderStatus } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<
    OrderStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
  > = {
    new: { label: "Nuevo", variant: "info" },
    received: { label: "Recibido", variant: "secondary" },
    preparing: { label: "En preparación", variant: "warning" },
    ready: { label: "Listo", variant: "success" },
    in_transit: { label: "En camino", variant: "info" },
    delivered: { label: "Entregado", variant: "success" },
    completed: { label: "Completado", variant: "default" },
    cancelled: { label: "Cancelado", variant: "destructive" },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant as any}
      className={`
        ${status === "new" ? "bg-blue-500 hover:bg-blue-600" : ""}
        ${status === "received" ? "bg-purple-500 hover:bg-purple-600" : ""}
        ${status === "preparing" ? "bg-amber-500 hover:bg-amber-600" : ""}
        ${status === "ready" ? "bg-green-500 hover:bg-green-600" : ""}
        ${status === "in_transit" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
        ${status === "delivered" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
        ${status === "completed" ? "bg-gray-500 hover:bg-gray-600" : ""}
        ${status === "cancelled" ? "bg-red-500 hover:bg-red-600" : ""}
      `}
    >
      {config.label}
    </Badge>
  )
}
