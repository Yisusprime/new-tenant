"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/lib/types/order"
import { getRecentOrders } from "@/lib/services/order-service"
import { Loader2 } from "lucide-react"
import { OrderStatusBadge } from "./order-status-badge"
import { OrderTypeBadge } from "./order-type-badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface RecentOrdersSummaryProps {
  tenantId: string
  branchId: string
}

export function RecentOrdersSummary({ tenantId, branchId }: RecentOrdersSummaryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const recentOrders = await getRecentOrders(tenantId, branchId)
        setOrders(recentOrders)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [tenantId, branchId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
        <CardDescription>Los últimos pedidos recibidos</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-medium">#{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</div>
                    <OrderTypeBadge type={order.type} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/tenant/${tenantId}/admin/orders`)}
            >
              Ver todos los pedidos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
