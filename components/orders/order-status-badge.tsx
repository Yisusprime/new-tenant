import { Badge } from "@/components/ui/badge"
import type { OrderStatus } from "@/lib/types/order"

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "new":
        return { label: "Nuevo", variant: "default" as const }
      case "received":
        return { label: "Recibido", variant: "secondary" as const }
      case "preparing":
        return { label: "En preparación", variant: "warning" as const }
      case "ready":
        return { label: "Listo", variant: "success" as const }
      case "in_transit":
        return { label: "En camino", variant: "info" as const }
      case "delivered":
        return { label: "Entregado", variant: "success" as const }
      case "completed":
        return { label: "Completado", variant: "success" as const }
      case "cancelled":
        return { label: "Cancelado", variant: "destructive" as const }
      default:
        return { label: status, variant: "default" as const }
    }
  }

  const { label, variant } = getStatusConfig(status)

  return <Badge variant={variant}>{label}</Badge>
}
