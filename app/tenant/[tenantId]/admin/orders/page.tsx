"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, RefreshCw } from "lucide-react"
import { useBranch } from "@/lib/hooks/use-branch"
import type { Order, OrderStatus } from "@/lib/types/order"
import { orderService } from "@/lib/services/order-service"
import OrdersList from "./components/orders-list"
import OrdersTableView from "./components/orders-table-view"
import OrdersDeliveryView from "./components/orders-delivery-view"
import CreateOrderModal from "./components/create-order-modal"
import NoBranchSelectedAlert from "@/components/no-branch-selected-alert"
import OrdersStats from "./components/orders-stats"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const { selectedBranch } = useBranch()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "tables" | "delivery">("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!selectedBranch) return

    const fetchOrders = async () => {
      setLoading(true)
      try {
        let fetchedOrders: Order[]

        if (activeTab === "all") {
          fetchedOrders = await orderService.getOrders(tenantId, selectedBranch.id)
        } else if (activeTab === "tables") {
          fetchedOrders = await orderService.getOrdersByType(tenantId, selectedBranch.id, ["dine_in"])
        } else {
          fetchedOrders = await orderService.getOrdersByType(tenantId, selectedBranch.id, ["delivery"])
        }

        setOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [tenantId, selectedBranch, activeTab, refreshTrigger])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      // Refresh orders list
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">Administra todos los pedidos de tu restaurante</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <OrdersLoadingSkeleton />
      ) : (
        <>
          <OrdersStats orders={orders} />

          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) => setActiveTab(value as "all" | "tables" | "delivery")}
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <OrdersList orders={orders} onStatusChange={handleStatusChange} loading={loading} />
            </TabsContent>

            <TabsContent value="tables">
              <OrdersTableView
                orders={orders.filter((order) => order.orderType === "dine_in")}
                onStatusChange={handleStatusChange}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="delivery">
              <OrdersDeliveryView
                orders={orders.filter((order) => order.orderType === "delivery")}
                onStatusChange={handleStatusChange}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onOrderCreated={() => {
          setCreateModalOpen(false)
          setRefreshTrigger((prev) => prev + 1)
        }}
      />
    </div>
  )
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
