"use client"

import { useState, useEffect } from "react"
import { useOrderContext } from "./order-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search, FileDown, Eye, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { OrderStatus, Order, PaymentStatus } from "@/lib/types/orders"
import { OrderDetailsDialog } from "./order-details-dialog"
import { formatCurrency } from "@/lib/utils"

export function OrderHistory() {
  const { orders, loading, error } = useOrderContext()
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Filtrar pedidos cuando cambian los filtros
  useEffect(() => {
    if (!orders) return

    let filtered = [...orders]

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filtrar por estado de pago
    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter)
    }

    // Filtrar por rango de fechas
    if (dateRange.from) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dateRange.from!
      })
    }

    if (dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate <= dateRange.to!
      })
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(term) ||
          (order.customerName && order.customerName.toLowerCase().includes(term)) ||
          (order.customerPhone && order.customerPhone.toLowerCase().includes(term)),
      )
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => b.createdAt - a.createdAt)

    setFilteredOrders(filtered)
  }, [orders, statusFilter, paymentFilter, dateRange, searchTerm])

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-500 text-white" },
      preparing: { label: "Preparando", className: "bg-blue-500 text-white" },
      ready: { label: "Listo", className: "bg-green-500 text-white" },
      delivered: { label: "Entregado", className: "bg-purple-500 text-white" },
      completed: { label: "Completado", className: "bg-green-700 text-white" },
      cancelled: { label: "Cancelado", className: "bg-red-500 text-white" },
    }

    return <Badge className={statusConfig[status].className}>{statusConfig[status].label}</Badge>
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const paymentConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      paid: { label: "Pagado", className: "bg-green-100 text-green-800 border-green-200" },
      partially_paid: { label: "Pago Parcial", className: "bg-blue-100 text-blue-800 border-blue-200" },
      refunded: { label: "Reembolsado", className: "bg-red-100 text-red-800 border-red-200" },
    }

    return (
      <Badge variant="outline" className={paymentConfig[status].className}>
        {paymentConfig[status].label}
      </Badge>
    )
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return

    // Crear contenido CSV
    const headers = ["Número", "Fecha", "Cliente", "Total", "Estado", "Pago"]
    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
      order.customerName || "N/A",
      order.total.toString(),
      order.status,
      order.paymentStatus,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `pedidos_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando historial de pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p>Error al cargar el historial de pedidos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Historial de Pedidos</h2>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredOrders.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o cliente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Estado del pedido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="preparing">Preparando</SelectItem>
            <SelectItem value="ready">Listos</SelectItem>
            <SelectItem value="delivered">Entregados</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Estado de pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pagos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="paid">Pagados</SelectItem>
            <SelectItem value="partially_paid">Pagos parciales</SelectItem>
            <SelectItem value="refunded">Reembolsados</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                "Seleccionar fechas"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={es}
            />
            <div className="flex items-center justify-between border-t p-3">
              <Button variant="ghost" size="sm" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                Limpiar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    from: new Date(today.setHours(0, 0, 0, 0)),
                    to: new Date(today.setHours(23, 59, 59, 999)),
                  })
                }}
              >
                Hoy
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron pedidos con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>{order.customerName || "N/A"}</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalles</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsDialog order={selectedOrder} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
      )}
    </div>
  )
}
