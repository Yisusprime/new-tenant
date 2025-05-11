"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { getOrders, getOrdersByType } from "@/lib/services/order-service"
import { getTables } from "@/lib/services/table-service"
import type { Order } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"
import { OrdersList } from "./components/orders-list"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { TablesList } from "./components/tables-list"
import { Skeleton } from "@/components/ui/skeleton"

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

  const loadOrders = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      const allOrders = await getOrders(tenantId, currentBranch.id)
      setOrders(allOrders)

      const tableOrdersData = await getOrdersByType(tenantId, currentBranch.id, "table")
      setTableOrders(tableOrdersData)

      const deliveryOrdersData = await getOrdersByType(tenantId, currentBranch.id, "delivery")
      setDeliveryOrders(deliveryOrdersData)

      const tablesData = await getTables(tenantId, currentBranch.id)
      setTables(tablesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [tenantId, currentBranch])

  const handleOrderCreated = () => {
    loadOrders()
    setCreateDialogOpen(false)
    setSelectedTable(null)
  }

  const handleStatusChange = () => {
    loadOrders()
  }

  const handleCreateOrderForTable = (table: Table) => {
    setSelectedTable(table)
    setCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestor de Pedidos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {currentBranch && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
          )}
        </div>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Todos los Pedidos</CardTitle>
                  <CardDescription>Gestiona todos los pedidos de la sucursal {currentBranch.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <OrdersList
                      orders={orders}
                      tenantId={tenantId}
                      branchId={currentBranch.id}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mesas</CardTitle>
                  <CardDescription>Gestiona los pedidos por mesa en la sucursal {currentBranch.name}</CardDescription>
                </CardHeader>
                <CardContent>
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
                      onCreateOrder={handleCreateOrderForTable}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos de Delivery</CardTitle>
                  <CardDescription>
                    Gestiona los pedidos de delivery en la sucursal {currentBranch.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <OrdersList
                      orders={deliveryOrders}
                      tenantId={tenantId}
                      branchId={currentBranch.id}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <CreateOrderDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            tenantId={tenantId}
            branchId={currentBranch.id}
            onOrderCreated={handleOrderCreated}
            selectedTable={selectedTable}
          />
        </>
      )}
    </div>
  )
}
