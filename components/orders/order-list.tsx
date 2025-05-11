"use client"

import { useEffect, useState } from "react"
import { type Order, type OrderType, getOrders, getOrdersByType } from "@/lib/services/order-service"
import { OrderCard } from "./order-card"
import { Skeleton } from "@/components/ui/skeleton"

interface OrderListProps {
  tenantId: string
  branchId: string
  activeTab: string
}

export function OrderList({ tenantId, branchId, activeTab }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        let fetchedOrders: Order[]

        if (activeTab === "all") {
          fetchedOrders = await getOrders(tenantId, branchId)
        } else {
          fetchedOrders = await getOrdersByType(tenantId, branchId, activeTab as OrderType)
        }

        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      fetchOrders()
    }
  }, [tenantId, branchId, activeTab])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No hay pedidos</h3>
        <p className="text-muted-foreground">No se encontraron pedidos para mostrar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} tenantId={tenantId} branchId={branchId} />
      ))}
    </div>
  )
}
