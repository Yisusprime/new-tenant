"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, FileDown } from "lucide-react"
import { useCashier } from "./cashier-context"
import { formatCurrency } from "@/lib/utils"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { SessionDetailsDialog } from "./session-details-dialog"

export function SessionHistory() {
  const { sessions, isLoading } = useCashier()
  const { user } = useAuth()
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Función para ver detalles de una sesión
  const handleViewDetails = async (sessionId: string) => {
    setSelectedSession(sessionId)
    setIsDetailsOpen(true)
    await loadSessionDetails(sessionId)
  }

  // Cargar detalles de una sesión específica
  const loadSessionDetails = async (sessionId: string) => {
    setLoadingDetails(true)
    try {
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) {
        throw new Error("Sesión no encontrada")
      }

      const tenantId = user?.tenantId
      if (!tenantId) {
        throw new Error("No se pudo identificar el inquilino")
      }

      // Obtener órdenes para esta sesión
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const ordersSnapshot = await get(ordersRef)

      let sessionOrders: any[] = []
      let financialSummary = {
        totalSales: 0,
        cashSales: 0,
        cardSales: 0,
        transferSales: 0,
        otherSales: 0,
        totalOrders: 0,
        completedOrders: 0,
        canceledOrders: 0,
      }

      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val()

        // Filtrar órdenes que pertenecen a esta sesión
        sessionOrders = Object.entries(ordersData)
          .map(([id, data]) => ({ id, ...(data as any) }))
          .filter((order: any) => {
            // Convertir timestamp si es necesario
            const orderTime =
              typeof order.createdAt === "object" && order.createdAt.toDate
                ? order.createdAt.toDate().getTime()
                : Number(order.createdAt)

            // Verificar si la orden está dentro del rango de tiempo de la sesión
            return orderTime >= session.startTime && (session.endTime ? orderTime <= session.endTime : true)
          })
          .sort((a: any, b: any) => b.createdAt - a.createdAt)

        // Calcular resumen financiero
        sessionOrders.forEach((order: any) => {
          if (order.status === "completed") {
            financialSummary.completedOrders++
            financialSummary.totalSales += Number(order.total) || 0

            // Clasificar por método de pago
            switch (order.paymentMethod) {
              case "cash":
                financialSummary.cashSales += Number(order.total) || 0
                break
              case "card":
                financialSummary.cardSales += Number(order.total) || 0
                break
              case "transfer":
                financialSummary.transferSales += Number(order.total) || 0
                break
              default:
                financialSummary.otherSales += Number(order.total) || 0
                break
            }
          } else if (order.status === "cancelled") {
            financialSummary.canceledOrders++
          }
        })

        financialSummary.totalOrders = sessionOrders.length
      }

      // Si la sesión tiene un resumen guardado, usarlo como respaldo
      if (session.summary) {
        console.log("Using saved summary from session:", session.summary)
        // Solo usar el resumen guardado si no encontramos órdenes
        if (financialSummary.totalOrders === 0) {
          financialSummary = {
            ...financialSummary,
            totalSales: session.summary.totalSales || 0,
            cashSales: session.summary.cashSales || 0,
            cardSales: session.summary.cardSales || 0,
            transferSales: 0,
            otherSales: session.summary.otherSales || 0,
            totalOrders: session.summary.totalOrders || 0,
            completedOrders: session.summary.completedOrders || 0,
            canceledOrders: session.summary.canceledOrders || 0,
          }
        }
      }

      setSessionDetails({
        session,
        orders: sessionOrders,
        financialSummary,
      })
    } catch (error) {
      console.error("Error loading session details:", error)
      setSessionDetails({
        session: sessions.find((s) => s.id === sessionId),
        orders: [],
        financialSummary: {
          totalSales: 0,
          cashSales: 0,
          cardSales: 0,
          transferSales: 0,
          otherSales: 0,
          totalOrders: 0,
          completedOrders: 0,
          canceledOrders: 0,
        },
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  // Exportar historial a CSV
  const exportToCSV = () => {
    if (sessions.length === 0) return

    const headers = ["ID", "Fecha Inicio", "Fecha Fin", "Estado", "Efectivo Inicial", "Efectivo Final", "Diferencia"]
    const rows = sessions.map((session) => [
      session.id,
      new Date(session.startTime).toLocaleString(),
      session.endTime ? new Date(session.endTime).toLocaleString() : "En curso",
      session.status === "open" ? "Abierta" : "Cerrada",
      session.initialCash?.toString() || "0",
      session.endCash?.toString() || "0",
      session.difference?.toString() || "0",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `historial_caja_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
          <CardDescription>Cargando historial...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
          <CardDescription>No hay sesiones registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8 text-muted-foreground">
            No se han registrado sesiones de caja
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Sesiones</CardTitle>
          <CardDescription>Registro de sesiones de caja</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Efectivo Inicial</TableHead>
                <TableHead>Efectivo Final</TableHead>
                <TableHead>Diferencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const startDate = new Date(session.startTime)
                const endDate = session.endTime ? new Date(session.endTime) : new Date()
                const duration = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)) // en minutos

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="font-medium">{startDate.toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{startDate.toLocaleTimeString()}</div>
                    </TableCell>
                    <TableCell>
                      {duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)}h ${duration % 60}min`}
                    </TableCell>
                    <TableCell>
                      {session.status === "open" ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Abierta</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Cerrada
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(session.initialCash || 0)}</TableCell>
                    <TableCell>{session.status === "closed" ? formatCurrency(session.endCash || 0) : "-"}</TableCell>
                    <TableCell>
                      {session.status === "closed" ? (
                        <span
                          className={
                            session.difference && session.difference < 0
                              ? "text-red-600"
                              : session.difference && session.difference > 0
                                ? "text-green-600"
                                : ""
                          }
                        >
                          {formatCurrency(session.difference || 0)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(session.id)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedSession && (
        <SessionDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          sessionDetails={sessionDetails}
          loading={loadingDetails}
        />
      )}
    </Card>
  )
}
