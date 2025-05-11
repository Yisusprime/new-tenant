import type { OrderType } from "@/lib/services/order-service"
import { Badge } from "@/components/ui/badge"
import { cva } from "class-variance-authority"

const typeBadgeVariants = cva("", {
  variants: {
    type: {
      dine_in: "bg-green-100 text-green-800 hover:bg-green-100",
      takeaway: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      delivery: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
  },
  defaultVariants: {
    type: "dine_in",
  },
})

interface OrderTypeBadgeProps {
  type: OrderType
}

export function OrderTypeBadge({ type }: OrderTypeBadgeProps) {
  const getTypeLabel = (type: OrderType): string => {
    const typeMap: Record<OrderType, string> = {
      dine_in: "Mesa",
      takeaway: "Para llevar",
      delivery: "Delivery",
    }
    return typeMap[type] || type
  }

  return (
    <Badge variant="outline" className={typeBadgeVariants({ type })}>
      {getTypeLabel(type)}
    </Badge>
  )
}
