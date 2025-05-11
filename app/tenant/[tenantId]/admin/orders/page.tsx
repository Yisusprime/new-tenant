"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useBranch } from "@/lib/hooks/use-branch"
import { getOrders, updateOrderStatus } from "@/lib/services/order-service"
import { OrdersList } from "./components/orders-list"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { OrderDetailsDialog } from "./components/order-details-dialog"
import { TablesListDialog } from "./components/tables-list"
import { Button } from "@/components/ui/button"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { useOrderNotifications } from "@/lib/hooks/use-order-notifications"
import { Bell, BellOff, Plus, Table } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Order } from "@/lib/types/order"

export default function OrdersPage() {
  const params = useParams<{ tenantId: string }>()
  const tenantId = params.tenantId
  const { selectedBranch } = useBranch()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [tablesOpen, setTablesOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  // Notificaciones de pedidos
  const { newOrder, updatedOrder, notificationsEnabled, toggleNotifications, playNotificationSound, soundLoaded } =
    useOrderNotifications(tenantId, selectedBranch?.id || null)

  // Cargar pedidos
  useEffect(() => {
    if (selectedBranch?.id) {
      loadOrders()
    }
  }, [selectedBranch, activeTab])

  // Manejar nuevos pedidos
  useEffect(() => {
    if (newOrder) {
      toast({
        title: "Nuevo pedido recibido",
        description: `Pedido #${newOrder.number} - ${newOrder.customerName}`,
        variant: "default",
      })
      loadOrders()
    }
  }, [newOrder])

  // Manejar pedidos actualizados
  useEffect(() => {
    if (updatedOrder) {
      loadOrders()
    }
  }, [updatedOrder])

  // Cargar pedidos
  const loadOrders = async () => {
    if (!selectedBranch?.id) return

    setLoading(true)
    try {
      const ordersData = await getOrders(tenantId, selectedBranch.id)

      // Filtrar por estado según la pestaña activa
      let filteredOrders: Order[] = []

      if (activeTab === "pending") {
        filteredOrders = ordersData.filter((order) => order.status === "pending" || order.status === "in_progress")
      } else if (activeTab === "completed") {
        filteredOrders = ordersData.filter((order) => order.status === "completed" || order.status === "delivered")
      } else if (activeTab === "cancelled") {
        filteredOrders = ordersData.filter((order) => order.status === "cancelled")
      } else {
        filteredOrders = ordersData
      }

      // Ordenar por fecha (más reciente primero)
      filteredOrders.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setOrders(filteredOrders)
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambio de estado de pedido
  const handleStatusChange = async (orderId: string, status: string) => {
    if (!selectedBranch?.id) return

    try {
      await updateOrderStatus(tenantId, selectedBranch.id, orderId, status)

      // Actualizar la lista de pedidos
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            return { ...order, status }
          }
          return order
        }),
      )

      // Cerrar el diálogo de detalles si está abierto
      if (orderDetailsOpen && selectedOrder?.id === orderId) {
        setOrderDetailsOpen(false)
        setSelectedOrder(null)
      }

      toast({
        title: "Estado actualizado",
        description: `El pedido ha sido marcado como ${status}`,
      })
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      })
    }
  }

  // Manejar creación de pedido
  const handleOrderCreated = () => {
    setCreateOrderOpen(false)
    loadOrders()
    toast({
      title: "Pedido creado",
      description: "El pedido ha sido creado exitosamente",
    })
  }

  // Manejar selección de pedido
  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order)
    setOrderDetailsOpen(true)
  }

  // Probar sonido de notificación
  const handleTestSound = async () => {
    const success = await playNotificationSound()
    if (success) {
      toast({
        title: "Sonido de notificación",
        description: "El sonido de notificación se está reproduciendo",
      })
    } else {
      toast({
        title: "Error",
        description: "No se pudo reproducir el sonido. Intente hacer clic en alguna parte de la página primero.",
        variant: "destructive",
      })
    }
  }

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gestiona los pedidos de tu restaurante</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setTablesOpen(true)} variant="outline" size="sm">
            <Table className="h-4 w-4 mr-2" />
            Mesas
          </Button>
          <Button onClick={() => setCreateOrderOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pedido
          </Button>
          <Button
            onClick={() => toggleNotifications()}
            variant="outline"
            size="sm"
            className={notificationsEnabled() ? "bg-green-50" : "bg-red-50"}
          >
            {notificationsEnabled() ? (
              <>
                <Bell className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-600">Notificaciones ON</span>
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-600">Notificaciones OFF</span>
              </>
            )}
          </Button>
          <Button onClick={handleTestSound} variant="outline" size="sm" className="bg-blue-50">
            <Bell className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-blue-600">Probar Sonido</span>
          </Button>
          {!soundLoaded() && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              Sonido no cargado
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <OrdersList
            orders={orders}
            loading={loading}
            onOrderSelect={handleOrderSelect}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>
      </Tabs>

      <CreateOrderDialog
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
        tenantId={tenantId}
        branchId={selectedBranch.id}
        onOrderCreated={handleOrderCreated}
      />

      <OrderDetailsDialog
        open={orderDetailsOpen}
        onOpenChange={setOrderDetailsOpen}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />

      <TablesListDialog
        open={tablesOpen}
        onOpenChange={setTablesOpen}
        tenantId={tenantId}
        branchId={selectedBranch.id}
        onCreateOrder={(table) => {
          setTablesOpen(false)
          setCreateOrderOpen(true)
        }}
      />
    </div>
  )
}
