"use client"

import { useEffect, useState } from "react"
import {
  type Order,
  type OrderType,
  getOrders,
  getOrdersByType,
  createSampleOrders,
} from "@/lib/services/order-service"
import { OrderCard } from "./order-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface OrderListProps {
  tenantId: string
  branchId: string
  activeTab: string
}

export function OrderList({ tenantId, branchId, activeTab }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchOrders = async () => {
    if (!tenantId || !branchId) {
      console.log("Missing tenantId or branchId")
      setError("Falta información del tenant o sucursal")
      setLoading(false)
      return
    }

    console.log(`Fetching orders: tenant=${tenantId}, branch=${branchId}, tab=${activeTab}`)
    setLoading(true)
    setError(null)

    try {
      let fetchedOrders: Order[]

      if (activeTab === "all") {
        fetchedOrders = await getOrders(tenantId, branchId)
      } else {
        fetchedOrders = await getOrdersByType(tenantId, branchId, activeTab as OrderType)
      }

      console.log(`Fetched ${fetchedOrders.length} orders`)
      setOrders(fetchedOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error al cargar los pedidos. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSampleOrders = async () => {
    try {
      setLoading(true)
      await createSampleOrders(tenantId, branchId)
      toast({
        title: "Pedidos de ejemplo creados",
        description: "Se han creado pedidos de ejemplo para pruebas",
      })
      setRefreshKey((prev) => prev + 1)
    } catch (err) {
      console.error("Error creating sample orders:", err)
      toast({
        title: "Error",
        description: "No se pudieron crear los pedidos de ejemplo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [tenantId, branchId, activeTab, refreshKey])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => setRefreshKey((prev) => prev + 1)} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <h3 className="text-lg font-medium">No hay pedidos</h3>
        <p className="text-muted-foreground">No se encontraron pedidos para mostrar.</p>
        <Button onClick={handleCreateSampleOrders} variant="outline">
          Crear pedidos de ejemplo
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setRefreshKey((prev) => prev + 1)} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            tenantId={tenantId}
            branchId={branchId}
            onStatusUpdate={() => setRefreshKey((prev) => prev + 1)}
          />
        ))}
      </div>
    </div>
  )
}
