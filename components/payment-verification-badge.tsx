import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { PaymentVerificationStatus } from "@/lib/types/cash-register"

interface PaymentVerificationBadgeProps {
  status: PaymentVerificationStatus
  className?: string
}

export function PaymentVerificationBadge({ status, className = "" }: PaymentVerificationBadgeProps) {
  switch (status) {
    case "verified":
      return (
        <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 ${className}`}>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verificado
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 ${className}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          Rechazado
        </Badge>
      )
    case "pending":
    default:
      return (
        <Badge variant="outline" className={`bg-yellow-50 text-yellow-700 border-yellow-200 ${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      )
  }
}
