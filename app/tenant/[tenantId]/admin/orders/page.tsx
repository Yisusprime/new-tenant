"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NoBranchSelectedAlert } from "../../../../components/no-branch-selected-alert"
import { useOrders } from "../../../../lib/hooks/use-orders"
import { OrderType } from "../../../../lib/types/order"
import { useBranch } from "../../../../lib/context/branch-context"

export default function OrdersPage() {
  const { currentBranch, loading: branchLoading } = useBranch()
  const { orders, loading, error, loadOrdersByType, loadAllOrders } = useOrders()
  const [activeTab, setActiveTab] = useState("all")

  // Manejar cambio de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "all") {
      loadAllOrders()
    } else if (value === "dine_in") {
      loadOrdersByType(OrderType.DINE_IN)
    } else if (value === "takeout") {
      loadOrdersByType(OrderType.TAKEOUT)
    } else if (value === "delivery") {
      loadOrdersByType(OrderType.DELIVERY)
    }
  }

  // Si no hay sucursal seleccionada, mostrar alerta
  if (!branchLoading && !currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <Button>Nuevo Pedido</Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="dine_in">Local</TabsTrigger>
          <TabsTrigger value="takeout">Para Llevar</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Pedidos</CardTitle>
              <CardDescription>Lista de todos los pedidos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando pedidos...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  {error}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => loadAllOrders()}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">No hay pedidos disponibles</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dine_in">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos para Consumo en Local</CardTitle>
              <CardDescription>Pedidos para consumir en el establecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando pedidos...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  {error}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => loadOrdersByType(OrderType.DINE_IN)}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">No hay pedidos para consumo en local</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="takeout">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos para Llevar</CardTitle>
              <CardDescription>Pedidos para recoger y llevar</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando pedidos...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  {error}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => loadOrdersByType(OrderType.TAKEOUT)}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">No hay pedidos para llevar</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos para Delivery</CardTitle>
              <CardDescription>Pedidos para entrega a domicilio</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Cargando pedidos...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">
                  {error}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => loadOrdersByType(OrderType.DELIVERY)}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">No hay pedidos para delivery</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt?.toDate?.() || order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Mesas</CardTitle>
              <CardDescription>Administra las mesas y sus pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">Funcionalidad de gestión de mesas en desarrollo</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
