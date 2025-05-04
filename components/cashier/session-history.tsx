"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"
import type { CashierSession } from "@/lib/types/cashier"
import type { Order } from "@/lib/types/orders"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

type FilterPeriod = "today" | "week" | "month" | "year" | "custom"

export function SessionHistory() {
  const { sessions } = useCashier()
  const { tenantId } = useAuth()
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [filteredSessions, setFilteredSessions] = useState<CashierSession[]>([])
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionOrders, setSessionOrders] = useState<Record<string, Order[]>>({})
  const [sessionSummaries, setSessionSummaries] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingErrors, setLoadingErrors] = useState<Record<string, string>>({})

  // Filter sessions based on selected period
  useEffect(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let fromDate: Date

    switch (filterPeriod) {
      case "today":
        fromDate = today
        break
      case "week":
        fromDate = new Date(today)
        fromDate.setDate(today.getDate() - 7)
        break
      case "month":
        fromDate = new Date(today)
        fromDate.setMonth(today.getMonth() - 1)
        break
      case "year":
        fromDate = new Date(today)
        fromDate.setFullYear(today.getFullYear() - 1)
        break
      case "custom":
        if (dateRange.from && dateRange.to) {
          fromDate = dateRange.from
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)

          setFilteredSessions(
            sessions.filter(
              (session) => session.startTime >= fromDate.getTime() && session.startTime <= toDate.getTime(),
            ),
          )
          return
        } else {
          // If custom range is not complete, show all sessions
          setFilteredSessions(sessions)
          return
        }
      default:
        fromDate = new Date(today)
        fromDate.setDate(today.getDate() - 7)
    }

    setFilteredSessions(sessions.filter((session) => session.startTime >= fromDate.getTime()))
  }, [filterPeriod, dateRange, sessions])

  // Load orders for expanded session
  useEffect(() => {
    if (!expandedSession || !tenantId) return

    const loadSessionData = async () => {
      if (sessionOrders[expandedSession]) return

      setIsLoading(true)
      setLoadingErrors((prev) => ({ ...prev, [expandedSession]: "" }))

      try {
        // Get session details
        const session = sessions.find((s) => s.id === expandedSession)
        if (!session) {
          throw new Error("Sesión no encontrada")
        }

        // Get all orders
        const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
        const snapshot = await get(ordersRef)

        if (!snapshot.exists()) {
          setSessionOrders((prev) => ({
            ...prev,
            [expandedSession]: [],
          }))
          setSessionSummaries((prev) => ({
            ...prev,
            [expandedSession]: {
              totalSales: 0,
              cashSales: 0,
              cardSales: 0,
              otherSales: 0,
              tips: 0,
            },
          }))
          return
        }

        const ordersData = snapshot.val()

        // Filter orders for this session
        const sessionStart = session.startTime
        const sessionEnd = session.endTime || Date.now()

        const filteredOrders = Object.entries(ordersData)
          .map(([id, data]) => ({
            id,
            ...(data as any),
          }))
          .filter((order: any) => {
            // Only include completed orders
            if (order.status !== "completed") {
              return false
            }

            // Include orders created during this session
            const orderTime = order.createdAt
            return orderTime >= sessionStart && orderTime <= sessionEnd
          })
          .sort((a, b) => b.createdAt - a.createdAt) // Sort by creation time (newest first)

        // Calculate summary
        let totalSales = 0
        let cashSales = 0
        let cardSales = 0
        let otherSales = 0
        let tips = 0

        filteredOrders.forEach((order: any) => {
          const orderTotal = Number.parseFloat(order.total) || 0
          totalSales += orderTotal

          if (order.paymentMethod === "cash") {
            cashSales += orderTotal
          } else if (order.paymentMethod === "card") {
            cardSales += orderTotal
          } else {
            otherSales += orderTotal
          }

          tips += Number.parseFloat(order.tip) || 0
        })

        // Store the results
        setSessionOrders((prev) => ({
          ...prev,
          [expandedSession]: filteredOrders,
        }))

        setSessionSummaries((prev) => ({
          ...prev,
          [expandedSession]: {
            totalSales,
            cashSales,
            cardSales,
            otherSales,
            tips,
          },
        }))
      } catch (err) {
        console.error("Error loading session orders:", err)
        setLoadingErrors((prev) => ({
          ...prev,
          [expandedSession]: "No se pudieron cargar las órdenes. Por favor, inténtelo de nuevo más tarde.",
        }))
      } finally {
        setIsLoading(false)
      }
    }

    loadSessionData()
  }, [expandedSession, tenantId, sessions, sessionOrders])

  const handleAccordionChange = (value: string) => {
    setExpandedSession(value === expandedSession ? null : value)
  }

  if (sessions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
          <CardDescription>No hay sesiones registradas</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historial de Sesiones</CardTitle>
        <CardDescription>Consulta el historial de sesiones de caja</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="week" value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as FilterPeriod)}>
          <TabsList className="mb-4">
            <TabsTrigger value="today">Hoy</TabsTrigger>
            <TabsTrigger value="week">Semana</TabsTrigger>
            <TabsTrigger value="month">Mes</TabsTrigger>
            <TabsTrigger value="year">Año</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          {filterPeriod === "custom" && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange as any} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="mt-4">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No hay sesiones en el período seleccionado</div>
            ) : (
              <Accordion type="single" collapsible value={expandedSession || ""} onValueChange={handleAccordionChange}>
                {filteredSessions.map((session) => {
                  const summary = sessionSummaries[session.id]
                  const orders = sessionOrders[session.id] || []
                  const hasError = loadingErrors[session.id]

                  return (
                    <AccordionItem key={session.id} value={session.id}>
                      <AccordionTrigger className="hover:bg-gray-50 px-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{new Date(session.startTime).toLocaleDateString()}</span>
                            <Badge variant={session.status === "open" ? "default" : "secondary"}>
                              {session.status === "open" ? "Abierta" : "Cerrada"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                              {session.status === "open" ? "Desde" : "Duración"}:{" "}
                              {session.status === "open"
                                ? format(new Date(session.startTime), "HH:mm", { locale: es })
                                : session.endTime
                                  ? `${Math.round((session.endTime - session.startTime) / (1000 * 60 * 60))}h ${Math.round(((session.endTime - session.startTime) % (1000 * 60 * 60)) / (1000 * 60))}m`
                                  : "—"}
                            </span>

                            {summary && <span className="font-medium">{formatCurrency(summary.totalSales || 0)}</span>}
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Información de apertura</h4>
                              <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Fecha:</span>
                                  <span>{new Date(session.startTime).toLocaleDateString()}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Hora:</span>
                                  <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Efectivo inicial:</span>
                                  <span>{formatCurrency(session.initialCash)}</span>
                                </div>
                                <div className="grid grid-cols-2">
                                  <span className="text-muted-foreground">Abierto por:</span>
                                  <span>{session.openedBy}</span>
                                </div>
                              </div>
                            </div>

                            {session.status === "closed" && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Información de cierre</h4>
                                <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <span>
                                      {session.endTime ? new Date(session.endTime).toLocaleDateString() : "—"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Hora:</span>
                                    <span>
                                      {session.endTime ? new Date(session.endTime).toLocaleTimeString() : "—"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Efectivo final:</span>
                                    <span>{session.endCash ? formatCurrency(session.endCash) : "—"}</span>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Tarjeta final:</span>
                                    <span>{session.endCard ? formatCurrency(session.endCard) : "—"}</span>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Diferencia:</span>
                                    <span
                                      className={`${session.difference && session.difference < 0 ? "text-red-600" : session.difference && session.difference > 0 ? "text-green-600" : ""}`}
                                    >
                                      {session.difference ? formatCurrency(session.difference) : "—"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <span className="text-muted-foreground">Cerrado por:</span>
                                    <span>{session.closedBy || "—"}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {expandedSession === session.id && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Resumen financiero</h4>
                              {isLoading ? (
                                <div className="flex justify-center items-center py-4">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  <span>Cargando datos...</span>
                                </div>
                              ) : summary ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-blue-50 p-3 rounded-md">
                                    <div className="text-xs text-blue-600">Ventas Totales</div>
                                    <div className="text-lg font-bold">{formatCurrency(summary.totalSales || 0)}</div>
                                  </div>

                                  <div className="bg-green-50 p-3 rounded-md">
                                    <div className="text-xs text-green-600">Efectivo</div>
                                    <div className="text-lg font-bold">{formatCurrency(summary.cashSales || 0)}</div>
                                  </div>

                                  <div className="bg-orange-50 p-3 rounded-md">
                                    <div className="text-xs text-orange-600">Tarjeta</div>
                                    <div className="text-lg font-bold">{formatCurrency(summary.cardSales || 0)}</div>
                                  </div>

                                  <div className="bg-purple-50 p-3 rounded-md">
                                    <div className="text-xs text-purple-600">Propinas</div>
                                    <div className="text-lg font-bold">{formatCurrency(summary.tips || 0)}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  No hay datos financieros disponibles
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium mb-2">Órdenes ({orders.length})</h4>
                            {isLoading && expandedSession === session.id ? (
                              <div className="text-center py-8 text-muted-foreground flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span>Cargando órdenes...</span>
                              </div>
                            ) : hasError ? (
                              <div className="text-center py-8 text-red-500">{loadingErrors[session.id]}</div>
                            ) : orders.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No hay órdenes en esta sesión
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left py-2 px-3">ID</th>
                                      <th className="text-left py-2 px-3">Hora</th>
                                      <th className="text-left py-2 px-3">Mesa/Cliente</th>
                                      <th className="text-right py-2 px-3">Total</th>
                                      <th className="text-left py-2 px-3">Estado</th>
                                      <th className="text-left py-2 px-3">Pago</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {orders.map((order) => (
                                      <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-3">{order.orderNumber || order.id.slice(-6)}</td>
                                        <td className="py-2 px-3">{new Date(order.createdAt).toLocaleTimeString()}</td>
                                        <td className="py-2 px-3">{order.table || order.customerName || "—"}</td>
                                        <td className="py-2 px-3 text-right">{formatCurrency(order.total || 0)}</td>
                                        <td className="py-2 px-3">
                                          <Badge
                                            variant={
                                              order.status === "completed"
                                                ? "success"
                                                : order.status === "canceled"
                                                  ? "destructive"
                                                  : "default"
                                            }
                                          >
                                            {order.status === "completed"
                                              ? "Completado"
                                              : order.status === "canceled"
                                                ? "Cancelado"
                                                : order.status === "in-progress"
                                                  ? "En progreso"
                                                  : order.status}
                                          </Badge>
                                        </td>
                                        <td className="py-2 px-3">
                                          {order.paymentMethod === "cash"
                                            ? "Efectivo"
                                            : order.paymentMethod === "card"
                                              ? "Tarjeta"
                                              : order.paymentMethod || "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {session.notes && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Notas</h4>
                              <div className="bg-gray-50 p-3 rounded-md text-sm">{session.notes}</div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
