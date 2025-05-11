"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Table } from "@/lib/services/table-service"
import type { Order } from "@/lib/types/order"
import { Utensils, Users, Clock, Plus, Eye } from "lucide-react"
import { OrderDetailsDialog } from "./order-details-dialog"

interface TablesListProps {
  tables: Table[]
  orders: Order[]
  tenantId: string
  branchId: string
  onCreateOrder: (table: Table) => void
  onStatusChange: () => void
}

export function TablesList({ tables, orders, tenantId, branchId, onCreateOrder, onStatusChange }: TablesListProps) {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Función para depuración
  console.log("Tables received:", tables)
  console.log("Orders received:", orders)

  const getTableOrders = (tableId: string) => {
    return orders.filter((order) => order.tableId === tableId)
  }

  const getActiveOrder = (tableId: string) => {
    return orders.find((order) => order.tableId === tableId && ["pending", "preparing", "ready"].includes(order.status))
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      available: "bg-green-500",
      occupied: "bg-red-500",
      reserved: "bg-blue-500",
      maintenance: "bg-yellow-500",
    }
    return statusColors[status as keyof typeof statusColors] || "bg-gray-500"
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No hay mesas configuradas</p>
        <Button onClick={() => router.push(`/tenant/${tenantId}/admin/restaurant/tables`)}>Configurar Mesas</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables
        .filter((table) => table.isActive)
        .map((table) => {
          const activeOrder = getActiveOrder(table.id)
          const isOccupied = table.status === "occupied" || !!activeOrder

          return (
            <Card
              key={table.id}
              className={`overflow-hidden ${isOccupied ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              <div className={`h-2 ${getStatusColor(table.status)}`}></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">Mesa {table.number}</CardTitle>
                  <Badge variant={isOccupied ? "destructive" : "success"}>
                    {isOccupied ? "Ocupada" : "Disponible"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Capacidad: {table.capacity} personas</span>
                  </div>
                  {table.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Utensils className="h-4 w-4 mr-2" />
                      <span>Ubicación: {table.location}</span>
                    </div>
                  )}
                  {activeOrder && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        Pedido: {activeOrder.orderNumber} (
                        {activeOrder.status === "pending"
                          ? "Pendiente"
                          : activeOrder.status === "preparing"
                            ? "En preparación"
                            : "Listo"}
                        )
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {activeOrder ? (
                  <Button variant="outline" className="w-full" onClick={() => handleViewDetails(activeOrder)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Pedido
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => onCreateOrder(table)}
                    disabled={table.status === "maintenance"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Pedido
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          tenantId={tenantId}
          branchId={branchId}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}
