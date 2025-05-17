"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw, Bell, BellOff, AlertTriangle } from "lucide-react"
import { getOrders, getOrdersByType } from "@/lib/services/order-service"
import { getTables } from "@/lib/services/table-service"
import { getOpenCashRegisters } from "@/lib/services/cash-register-service"
import type { Order } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"
import type { CashRegister } from "@/lib/types/cash-register"
import { OrdersList } from "./components/orders-list"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { TablesList } from "./components/tables-list"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { useOrderNotifications } from "@/lib/hooks/use-order-notifications"
import { VisualNotification } from "@/components/visual-notification"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OpenCashRegisterDialog } from "../cash-register/components/open-cash-register-dialog"

export default function OrdersPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [tableOrders, setTableOrders] = useState<Order[]>([])
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [notificationsOn, setNotificationsOn] = useState(true)

  // Estado para las cajas abiertas
  const [openCashRegisters, setOpenCashRegisters] = useState<CashRegister[]>([])
  const [openCashRegisterDialogOpen, setOpenCashRegisterDialogOpen] = useState(false)
  const [loadingCashRegisters, setLoadingCashRegisters] = useState(false)

  // Usar el hook de notificaciones
  const {
    newOrder,
    toggleNotifications,
    notificationsEnabled,
    showNotification,
    notificationMessage,
    notificationOrderId,
    hideNotification,
  } = useOrderNotifications(tenantId, currentBranch?.id || null)

  // Inicializar el estado de notificaciones
  useEffect(() => {
    setNotificationsOn(notificationsEnabled())
  }, [])

  // Cargar cajas abiertas
  const loadOpenCashRegisters = async () => {
    if (!currentBranch) return

    try {
      setLoadingCashRegisters(true)
      const registers = await getOpenCashRegisters(tenantId, currentBranch.id)
      console.log("Cajas abiertas cargadas:", registers)
      setOpenCashRegisters(registers)
    } catch (error) {
      console.error("Error al cargar cajas abiertas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cajas abiertas",
        variant: "destructive",
      })
    } finally {
      setLoadingCashRegisters(false)
    }
  }

  const loadOrders = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)

      // Cargar mesas primero
      console.log("Cargando mesas...")
      const tablesData = await getTables(tenantId, currentBranch.id)
      console.log("Mesas cargadas:", tablesData)
      setTables(tablesData)

      // Luego cargar pedidos
      console.log("Cargando pedidos...")
      const allOrders = await getOrders(tenantId, currentBranch.id)
      console.log("Pedidos cargados:", allOrders)
      setOrders(allOrders)

      const tableOrdersData = await getOrdersByType(tenantId, currentBranch.id, "table")
      setTableOrders(tableOrdersData)

      const deliveryOrdersData = await getOrdersByType(tenantId, currentBranch.id, "delivery")
      setDeliveryOrders(deliveryOrdersData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch) {
      loadOrders()
      loadOpenCashRegisters()
    }
  }, [tenantId, currentBranch])

  // Efecto para mostrar notificación cuando llega un nuevo pedido
  useEffect(() => {
    if (newOrder) {
      toast({
        title: "¡Nuevo pedido!",
        description: `Pedido #${newOrder.orderNumber} recibido`,
        variant: "default",
      })

      // Actualizar la lista de pedidos
      loadOrders()
    }
  }, [newOrder])

  const handleOrderCreated = () => {
    loadOrders()
    setCreateDialogOpen(false)
    setSelectedTable(null)
  }

  const handleStatusChange = () => {
    loadOrders()
  }

  const handleCreateOrderForTable = (table: Table) => {
    // Verificar si hay cajas abiertas
    if (openCashRegisters.length === 0) {
      toast({
        title: "No hay cajas abiertas",
        description: "Debe abrir una caja para poder crear pedidos",
        variant: "destructive",
      })
      return
    }

    setSelectedTable(table)
    setCreateDialogOpen(true)
  }

  // Función para crear un pedido desde una mesa específica
  const handleCreateTableOrder = (table: Table) => {
    // Verificar si hay cajas abiertas
    if (openCashRegisters.length === 0) {
      toast({
        title: "No hay cajas abiertas",
        description: "Debe abrir una caja para poder crear pedidos",
        variant: "destructive",
      })
      return
    }

    // Verificar que la mesa tenga un ID válido
    if (!table || !table.id) {
      console.error("Error: Intento de crear pedido con mesa inválida", table)
      return
    }

    console.log("Creando pedido para mesa:", table)
    setSelectedTable(table)
    setCreateDialogOpen(true)
  }

  const handleToggleNotifications = () => {
    const isEnabled = toggleNotifications()
    setNotificationsOn(isEnabled)
    toast({
      title: isEnabled ? "Notificaciones activadas" : "Notificaciones desactivadas",
      description: isEnabled ? "Recibirás alertas de nuevos pedidos" : "No recibirás alertas de nuevos pedidos",
      variant: "default",
    })
  }

  const handleOpenCashRegister = () => {
    setOpenCashRegisterDialogOpen(true)
  }

  const handleCashRegisterCreated = () => {
    loadOpenCashRegisters()
    setOpenCashRegisterDialogOpen(false)
    toast({
      title: "Caja abierta",
      description: "Ahora puede recibir pedidos",
      variant: "default",
    })
  }

  return (
    <div className="space-y-6">
      {/* Componente de notificación visual */}
      <VisualNotification
        show={showNotification}
        message={notificationMessage}
        orderId={notificationOrderId}
        tenantId={tenantId}
        branchId={currentBranch?.id}
        onClose={hideNotification}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestor de Pedidos</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleNotifications}
            title={notificationsOn ? "Desactivar notificaciones" : "Activar notificaciones"}
          >
            {notificationsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadOrders()
              loadOpenCashRegisters()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {currentBranch && openCashRegisters.length > 0 && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
          )}
          {currentBranch && openCashRegisters.length === 0 && (
            <Button size="sm" onClick={handleOpenCashRegister}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          )}
        </div>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && openCashRegisters.length === 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay cajas abiertas</AlertTitle>
          <AlertDescription>
            Debe abrir una caja para poder recibir pedidos.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={handleOpenCashRegister}>
              Abrir caja ahora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {currentBranch && (
        <>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-4">Todos los Pedidos</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : (
                  <OrdersList
                    orders={orders}
                    tenantId={tenantId}
                    branchId={currentBranch.id}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-4">Mesas</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <TablesList
                    tables={tables}
                    orders={tableOrders}
                    tenantId={tenantId}
                    branchId={currentBranch.id}
                    onCreateOrder={handleCreateTableOrder}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-4">Pedidos de Delivery</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : (
                  <OrdersList
                    orders={deliveryOrders}
                    tenantId={tenantId}
                    branchId={currentBranch.id}
                    onStatusChange={handleStatusChange}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>

          <CreateOrderDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            tenantId={tenantId}
            branchId={currentBranch.id}
            onOrderCreated={handleOrderCreated}
            selectedTable={selectedTable}
            cashRegisters={openCashRegisters}
          />

          <OpenCashRegisterDialog
            open={openCashRegisterDialogOpen}
            onOpenChange={setOpenCashRegisterDialogOpen}
            tenantId={tenantId}
            branchId={currentBranch.id}
            onCashRegisterCreated={handleCashRegisterCreated}
          />
        </>
      )}
    </div>
  )
}
