"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Order } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
import { Clock, DollarSign, ShoppingBag, Truck } from "lucide-react"

interface OrdersStatsProps {
  orders: Order[]
}

export default function OrdersStats({ orders }: OrdersStatsProps) {
  // Calculate stats
  const totalOrders = orders.length

  const pendingOrders = orders.filter((order) => ["pending", "received", "preparing"].includes(order.status)).length

  const deliveryOrders = orders.filter((order) => order.orderType === "delivery").length

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">Todos los pedidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">Pedidos en proceso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pedidos Delivery</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{deliveryOrders}</div>
          <p className="text-xs text-muted-foreground">Pedidos a domicilio</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">De todos los pedidos</p>
        </CardContent>
      </Card>
    </div>
  )
}
