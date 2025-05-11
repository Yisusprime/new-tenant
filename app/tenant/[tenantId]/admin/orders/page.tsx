"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOrders } from "@/lib/hooks/use-orders"
import { OrderType } from "@/lib/types/order"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { useBranch } from "@/lib/context/branch-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const { currentBranch } = useBranch()
  const { orders, loading, error, loadAllOrders, loadOrdersByType } = useOrders()
  const [activeTab, setActiveTab] = useState("all")

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Pedidos</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={() => handleTabChange(activeTab)} className="self-start">
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
          <TabsTrigger value="dine_in">Mesas</TabsTrigger>
          <TabsTrigger value="takeout">Para Llevar</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-lg text-muted-foreground">No hay pedidos disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Crea un nuevo pedido para comenzar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Pedido #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "ready"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Pendiente"
                        : order.status === "in_progress"
                          ? "En Proceso"
                          : order.status === "ready"
                            ? "Listo"
                            : order.status === "completed"
                              ? "Completado"
                              : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dine_in" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-lg text-muted-foreground">No hay pedidos de mesa disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Crea un nuevo pedido de mesa para comenzar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Mesa #{order.tableNumber} - Pedido #{order.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "ready"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Pendiente"
                        : order.status === "in_progress"
                          ? "En Proceso"
                          : order.status === "ready"
                            ? "Listo"
                            : order.status === "completed"
                              ? "Completado"
                              : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="takeout" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-lg text-muted-foreground">No hay pedidos para llevar disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Crea un nuevo pedido para llevar para comenzar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Para Llevar - Pedido #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name} - {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "ready"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Pendiente"
                        : order.status === "in_progress"
                          ? "En Proceso"
                          : order.status === "ready"
                            ? "Listo"
                            : order.status === "completed"
                              ? "Completado"
                              : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-lg text-muted-foreground">No hay pedidos de delivery disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Crea un nuevo pedido de delivery para comenzar</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Delivery - Pedido #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.name} - {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "ready"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Pendiente"
                        : order.status === "in_progress"
                          ? "En Proceso"
                          : order.status === "ready"
                            ? "Listo"
                            : order.status === "completed"
                              ? "Completado"
                              : "Cancelado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
