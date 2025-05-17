import { Badge } from "@/components/ui/badge"

type VerificationStatus = "pending" | "verified" | "rejected" | undefined

interface PaymentVerificationBadgeProps {
  status: VerificationStatus
}

export function PaymentVerificationBadge({ status }: PaymentVerificationBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    verified: {
      label: "Verificado",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      label: "Rechazado",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    undefined: {
      label: "Pendiente",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
  }

  const config = statusConfig[status || "pending"]

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
