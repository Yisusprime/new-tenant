"use client"

import { useState, useEffect } from "react"
import { useOrders } from "@/lib/hooks/use-orders"
import { OrderList } from "./components/order-list"
import { TableManagement } from "./components/table-management"
import { OrderDetails } from "./components/order-details"
import { CreateOrderForm } from "./components/create-order-form"
import type { Order, OrderStatus } from "@/lib/types/order"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, RefreshCw } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function OrdersPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const { toast } = useToast()

  const {
    orders,
    tables,
    loading,
    error,
    fetchOrders,
    fetchOrdersByType,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    fetchAvailableTables,
    createTable,
    updateTable,
    deleteTable,
  } = useOrders(tenantId)

  const [activeTab, setActiveTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const [availableTables, setAvailableTables] = useState([])
  const [occupiedTableIds, setOccupiedTableIds] = useState<string[]>([])

  // Cargar pedidos según la pestaña activa
  useEffect(() => {
    if (!currentBranch) return

    const loadOrders = async () => {
      if (activeTab === "all") {
        await fetchOrders()
      } else if (activeTab === "tables") {
        await fetchOrdersByType("table")
      } else if (activeTab === "delivery") {
        await fetchOrdersByType("delivery")
      } else if (activeTab === "dine_in") {
        await fetchOrdersByType("dine_in")
      } else if (activeTab === "takeaway") {
        await fetchOrdersByType("takeaway")
      }
    }

    loadOrders()
  }, [activeTab, currentBranch, fetchOrders, fetchOrdersByType])

  // Obtener mesas ocupadas
  useEffect(() => {
    if (!currentBranch) return

    const getOccupiedTables = () => {
      const tableOrders = orders.filter(
        (order) => order.type === "table" && ["pending", "preparing", "ready"].includes(order.status),
      )

      const tableIds = tableOrders.map((order) => order.tableInfo?.id).filter(Boolean) as string[]

      setOccupiedTableIds(tableIds)
    }

    getOccupiedTables()
  }, [orders, currentBranch])

  // Cargar mesas disponibles al abrir el formulario de creación
  useEffect(() => {
    if (isCreateOrderOpen && currentBranch) {
      const loadAvailableTables = async () => {
        try {
          const tables = await fetchAvailableTables()
          setAvailableTables(tables)
        } catch (error) {
          console.error("Error loading available tables:", error)
        }
      }

      loadAvailableTables()
    }
  }, [isCreateOrderOpen, currentBranch, fetchAvailableTables])

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await fetchOrderById(orderId)
      if (order) {
        setSelectedOrder(order)
        setIsOrderDetailsOpen(true)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido.",
        variant: "destructive",
      })
    }
  }

  const handleEditOrder = (orderId: string) => {
    // Implementar edición de pedido
    toast({
      title: "Función no implementada",
      description: "La edición de pedidos se implementará próximamente.",
    })
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.")) {
      try {
        await deleteOrder(orderId)
        toast({
          title: "Pedido eliminado",
          description: "El pedido ha sido eliminado exitosamente.",
        })
      } catch (error) {
        console.error("Error deleting order:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status)
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido.",
        variant: "destructive",
      })
    }
  }

  const handleCreateOrder = async (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    try {
      const orderId = await createOrder(order)
      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado exitosamente.",
      })
      return orderId
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el pedido.",
        variant: "destructive",
      })
      throw error
    }
  }

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOrders()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreateOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-md">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="dine_in">Local</TabsTrigger>
          <TabsTrigger value="takeaway">Para llevar</TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <OrderList
            orders={orders}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="dine_in" className="mt-6">
          <OrderList
            orders={orders}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="takeaway" className="mt-6">
          <OrderList
            orders={orders}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <div className="space-y-8">
            <OrderList
              orders={orders}
              onViewOrder={handleViewOrder}
              onEditOrder={handleEditOrder}
              onDeleteOrder={handleDeleteOrder}
              onUpdateStatus={handleUpdateStatus}
            />

            <TableManagement
              tables={tables}
              onCreateTable={createTable}
              onUpdateTable={updateTable}
              onDeleteTable={deleteTable}
              occupiedTableIds={occupiedTableIds}
            />
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <OrderList
            orders={orders}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del pedido */}
      <OrderDetails
        order={selectedOrder}
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Formulario de creación de pedido */}
      <CreateOrderForm
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onCreateOrder={handleCreateOrder}
        availableTables={availableTables}
        tenantId={tenantId}
        branchId={currentBranch.id}
      />
    </div>
  )
}
