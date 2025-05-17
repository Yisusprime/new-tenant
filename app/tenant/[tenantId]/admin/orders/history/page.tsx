"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Download, RefreshCw, Search } from "lucide-react"
import { getOrdersByDateRange } from "@/lib/services/order-service"
import type { Order, OrderStatus } from "@/lib/types/order"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { OrdersList } from "../components/orders-list"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function OrderHistoryPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [dateRange, setDateRange] = useState<"today" | "yesterday" | "week" | "month" | "custom">("today")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar pedidos
  const loadOrders = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)

      // Determinar fechas según el rango seleccionado
      let start: Date
      let end: Date = new Date()
      end.setHours(23, 59, 59, 999) // Final del día actual

      switch (dateRange) {
        case "today":
          start = new Date()
          start.setHours(0, 0, 0, 0) // Inicio del día actual
          break
        case "yesterday":
          start = subDays(new Date(), 1)
          start.setHours(0, 0, 0, 0) // Inicio del día anterior
          end = subDays(new Date(), 1)
          end.setHours(23, 59, 59, 999) // Final del día anterior
          break
        case "week":
          start = startOfWeek(new Date(), { weekStartsOn: 1 }) // Lunes de esta semana
          end = endOfWeek(new Date(), { weekStartsOn: 1 }) // Domingo de esta semana
          break
        case "month":
          start = startOfMonth(new Date()) // Primer día del mes actual
          end = endOfMonth(new Date()) // Último día del mes actual
          break
        case "custom":
          start = startDate
          start.setHours(0, 0, 0, 0)
          end = endDate
          end.setHours(23, 59, 59, 999)
          break
        default:
          start = new Date()
          start.setHours(0, 0, 0, 0)
      }

      // Cargar pedidos por rango de fechas
      const ordersData = await getOrdersByDateRange(tenantId, currentBranch.id, start, end)
      setOrders(ordersData)
      applyFilters(ordersData, statusFilter, searchTerm)
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

  // Aplicar filtros a los pedidos
  const applyFilters = (ordersToFilter: Order[], status: OrderStatus | "all", search: string) => {
    let result = [...ordersToFilter]

    // Filtrar por estado
    if (status !== "all") {
      result = result.filter((order) => order.status === status)
    }

    // Filtrar por término de búsqueda
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchLower) ||
          (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
          (order.customerPhone && order.customerPhone.toLowerCase().includes(searchLower)),
      )
    }

    setFilteredOrders(result)
  }

  useEffect(() => {
    if (currentBranch) {
      loadOrders()
    }
  }, [tenantId, currentBranch, dateRange, startDate, endDate])

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters(orders, statusFilter, searchTerm)
  }, [statusFilter, searchTerm])

  const handleStatusChange = () => {
    loadOrders()
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as "today" | "yesterday" | "week" | "month" | "custom")
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as OrderStatus | "all")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters(orders, statusFilter, searchTerm)
  }

  const getDateRangeText = () => {
    switch (dateRange) {
      case "today":
        return `Hoy (${format(new Date(), "dd/MM/yyyy")})`
      case "yesterday":
        return `Ayer (${format(subDays(new Date(), 1), "dd/MM/yyyy")})`
      case "week":
        return `Esta semana (${format(startOfWeek(new Date(), { weekStartsOn: 1 }), "dd/MM/yyyy")} - ${format(endOfWeek(new Date(), { weekStartsOn: 1 }), "dd/MM/yyyy")})`
      case "month":
        return `Este mes (${format(startOfMonth(new Date()), "dd/MM/yyyy")} - ${format(endOfMonth(new Date()), "dd/MM/yyyy")})`
      case "custom":
        return `Personalizado (${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")})`
      default:
        return "Seleccione un rango de fechas"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/tenant/${tenantId}/admin/orders`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Historial de Pedidos</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dateRange">Rango de Fechas</Label>
                  <Select value={dateRange} onValueChange={handleDateRangeChange}>
                    <SelectTrigger id="dateRange">
                      <SelectValue placeholder="Seleccionar rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateRange === "custom" && (
                  <>
                    <div>
                      <Label htmlFor="startDate">Fecha Inicio</Label>
                      <DatePicker id="startDate" date={startDate} setDate={setStartDate} className="w-full" />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Fecha Fin</Label>
                      <DatePicker id="endDate" date={endDate} setDate={setEndDate} className="w-full" />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="preparing">En preparación</SelectItem>
                      <SelectItem value="ready">Listo</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2">
                  <form onSubmit={handleSearch} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="search">Buscar</Label>
                      <Input
                        id="search"
                        placeholder="Número de pedido, cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button type="submit" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-medium mb-2">Pedidos: {getDateRangeText()}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Mostrando {filteredOrders.length} pedidos
              {statusFilter !== "all" && ` con estado "${statusFilter}"`}
              {searchTerm && ` que coinciden con "${searchTerm}"`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No se encontraron pedidos con los filtros seleccionados.
              </div>
            ) : (
              <OrdersList
                orders={filteredOrders}
                tenantId={tenantId}
                branchId={currentBranch.id}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
