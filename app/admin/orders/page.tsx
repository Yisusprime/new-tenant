"use client"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ShiftProvider } from "@/components/orders/shift-context"
import OrdersContent from "./orders-content"

export default function OrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  const tenantId = user?.tenantId || (params.tenantId as string)
  const router = useRouter()

  console.log("OrdersPage - Using tenant ID:", tenantId)

  return (
    <div className="flex h-screen overflow-hidden">
      <ShiftProvider tenantId={tenantId}>
        <OrdersContent tenantId={tenantId} router={router} />
      </ShiftProvider>
    </div>
  )
}
