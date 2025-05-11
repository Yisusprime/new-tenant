"use client"

import { useEffect, useState } from "react"
import type { Order, OrderType } from "@/lib/types/order"
import { OrderCard } from "./order-card"
import { getOrders, getOrdersByType } from "@/lib/services/order-service"
import { Loader2 } from "lucide-react"

interface OrderListProps {
  tenantId: string
  branchId: string
  activeTab: string
}

export function OrderList({ tenantId, branchId, activeTab }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let fetchedOrders: Order[]

      if (activeTab === "all") {
        fetchedOrders = await getOrders(tenantId, branchId)
      } else {
        fetchedOrders = await getOrdersByType(tenantId, branchId, activeTab as OrderType)
      }

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [tenantId, branchId, activeTab])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay pedidos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} tenantId={tenantId} branchId={branchId} onStatusUpdate={fetchOrders} />
      ))}
    </div>
  )
}
