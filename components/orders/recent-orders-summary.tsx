"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrders } from "@/lib/services/order-service"
import type { Order } from "@/lib/types/order"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge } from "./order-status-badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface RecentOrdersSummaryProps {
  tenantId: string
  branchId: string
}

export function RecentOrdersSummary({ tenantId, branchId }: RecentOrdersSummaryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const fetchedOrders = await getOrders(tenantId, branchId)
        setOrders(fetchedOrders.slice(0, 5)) // Get only the 5 most recent orders
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      fetchRecentOrders()
    }
  }, [tenantId, branchId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Los últimos pedidos recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Los últimos pedidos recibidos</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/tenant/${tenantId}/admin/orders`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver todos
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No hay pedidos recientes</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Pedido #{order.orderNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">${order.total.toFixed(2)}</div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
