"use client"

import { useState } from "react"
import { useOrderContext } from "./order-context"
import { OrderCard } from "./order-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, RefreshCw } from "lucide-react"
import type { OrderStatus } from "@/lib/types/orders"

interface OrderListProps {
  currentShiftId?: string
}

export function OrderList({ currentShiftId }: OrderListProps) {
  const { orders, loading, error, refreshOrders } = useOrderContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filtrar órdenes por el turno actual si se proporciona un ID de turno
  const filteredOrders = orders.filter((order) => {
    // Si no hay un turno actual especificado, mostrar todas las órdenes
    if (!currentShiftId) return true

    // Si la orden tiene un shiftId y es diferente al turno actual, no mostrarla
    if (order.shiftId && order.shiftId !== currentShiftId) return false

    // Si estamos en la pestaña "all" (todos), mostrar solo pedidos activos
    if (activeTab === "all") {
      return order.status !== "completed" && order.status !== "cancelled"
    }

    // En las pestañas específicas, mostrar todos los pedidos que coincidan con ese estado
    // y que pertenezcan al turno actual o no tengan turno asignado
    return order.status === activeTab
  })

  // Filtrar por estado y término de búsqueda
  const displayedOrders = filteredOrders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchTerm)

    return matchesSearch
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshOrders()
    setTimeout(() => setIsRefreshing(false), 500) // Mostrar animación por al menos 500ms
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, cliente o mesa..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as OrderStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="preparing">Preparando</TabsTrigger>
          <TabsTrigger value="ready">Listos</TabsTrigger>
          <TabsTrigger value="delivered">Entregados</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>
      </Tabs>

      {displayedOrders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No hay pedidos {activeTab !== "all" ? `con estado "${activeTab}"` : ""} para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
