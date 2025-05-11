"use client"

import { useState, useEffect } from "react"
import type { Order, OrderType } from "@/lib/types/order"
import { getOrders } from "@/lib/services/order-service"
import { OrderCard } from "./order-card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface OrderListProps {
  tenantId: string
  branchId: string
  type?: OrderType
  refreshTrigger?: number
}

export function OrderList({ tenantId, branchId, type, refreshTrigger = 0 }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedOrders = await getOrders(tenantId, branchId, type)
      setOrders(fetchedOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("No se pudieron cargar los pedidos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [tenantId, branchId, type, refreshTrigger])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay pedidos</h3>
        <p className="mt-1 text-sm text-gray-500">
          {type
            ? `No hay pedidos de tipo ${type === "dine_in" ? "Mesa" : type === "takeaway" ? "Para llevar" : "Delivery"}.`
            : "No hay pedidos disponibles."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} tenantId={tenantId} onStatusChange={fetchOrders} />
      ))}
    </div>
  )
}
