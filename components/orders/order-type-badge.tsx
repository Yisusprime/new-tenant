import { Badge } from "@/components/ui/badge"
import type { OrderType } from "@/lib/types/order"

interface OrderTypeBadgeProps {
  type: OrderType
}

export function OrderTypeBadge({ type }: OrderTypeBadgeProps) {
  const getTypeConfig = (type: OrderType) => {
    switch (type) {
      case "dine_in":
        return { label: "Mesa", variant: "outline" as const }
      case "takeaway":
        return { label: "Para llevar", variant: "outline" as const }
      case "delivery":
        return { label: "Delivery", variant: "outline" as const }
      default:
        return { label: type, variant: "outline" as const }
    }
  }

  const { label, variant } = getTypeConfig(type)

  return <Badge variant={variant}>{label}</Badge>
}
