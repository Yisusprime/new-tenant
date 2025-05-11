import type React from "react"
import type { OrderType } from "@/lib/types/order"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Car, ShoppingBag } from "lucide-react"

interface OrderTypeBadgeProps {
  type: OrderType
}

export function OrderTypeBadge({ type }: OrderTypeBadgeProps) {
  const typeConfig: Record<OrderType, { label: string; icon: React.ReactNode; className: string }> = {
    dine_in: {
      label: "Mesa",
      icon: <UtensilsCrossed className="h-3 w-3 mr-1" />,
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    takeaway: {
      label: "Para llevar",
      icon: <ShoppingBag className="h-3 w-3 mr-1" />,
      className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
    },
    delivery: {
      label: "Delivery",
      icon: <Car className="h-3 w-3 mr-1" />,
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
  }

  const config = typeConfig[type]

  return (
    <Badge variant="outline" className={`flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
