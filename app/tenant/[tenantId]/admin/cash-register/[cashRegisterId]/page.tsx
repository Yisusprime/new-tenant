"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useBranch } from "@/lib/context/branch-context"
import { getCashRegister } from "@/lib/services/cash-register-service"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { CashRegister } from "@/lib/types/cash-register"
import { ArrowLeft, CalendarRange, Clock, DollarSign, FileText, Printer, User } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function CashRegisterDetailsPage({
  params,
}: {
  params: { tenantId: string; cashRegisterId: string }
}) {
  const { tenantId, cashRegisterId } = params
  const { currentBranch } = useBranch()
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadCashRegister() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const register = await getCashRegister(tenantId, currentBranch.id, cashRegisterId)
        setCashRegister(register)
      } catch (error) {
        console.error("Error al cargar los detalles de la caja:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCashRegister()
  }, [tenantId, currentBranch, cashRegisterId])

  const handleBack = () => {
    router.back()
  }

  const handlePrint = () => {
    window.print()
  }

  // Colores para los gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles de Caja</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Reporte
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      ) : cashRegister ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Caja #{cashRegisterId.slice(0, 6)}</CardTitle>
                  <CardDescription>
                    {cashRegister.status === "open" ? "Caja actualmente abierta" : "Caja cerrada"}
                  </CardDescription>
                </div>
                <Badge variant={cashRegister.status === "open" ? "outline" : "secondary"} className="ml-auto">
                  {cashRegister.status === "open" ? "Abierta" : "Cerrada"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 flex items-center mb-1">
                    <CalendarRange className="h-4 w-4 mr-1" />
                    Apertura
                  </span>
                  <span className="font-medium">{formatDateTime(cashRegister.openedAt)}</span>
                </div>

                {cashRegister.closedAt && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 flex items-center mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      Cierre
                    </span>
                    <span className="font-medium">{formatDateTime(cashRegister.closedAt)}</span>
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 flex items-center mb-1">
                    <User className="h-4 w-4 mr-1" />
                    Abierta por
                  </span>
                  <span className="font-medium">{cashRegister.openedBy}</span>
                </div>

                {cashRegister.closedBy && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 flex items-center mb-1">
                      <User className="h-4 w-4 mr-1" />
                      Cerrada por
                    </span>
                    <span className="font-medium">{cashRegister.closedBy}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Monto Inicial</span>
                  <span className="text-xl font-bold">{formatCurrency(cashRegister.initialAmount)}</span>
                </div>

                {cashRegister.status === "closed" && (
                  <>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Monto Final</span>
                      <span className="text-xl font-bold">{formatCurrency(cashRegister.finalAmount || 0)}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Monto Esperado</span>
                      <span className="text-xl font-bold">{formatCurrency(cashRegister.expectedAmount || 0)}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">Diferencia</span>
                      <span
                        className={`text-xl font-bold ${
                          (cashRegister.difference || 0) < 0
                            ? "text-red-600"
                            : (cashRegister.difference || 0) > 0
                              ? "text-green-600"
                              : ""
                        }`}
                      >
                        {formatCurrency(cashRegister.difference || 0)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {cashRegister.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Notas:</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{cashRegister.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Ventas</CardTitle>
                <CardDescription>Desglose de ventas durante el periodo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-gray-500">Total Ventas</p>
                    <p className="text-xl font-bold">{formatCurrency(cashRegister.summary?.totalSales || 0)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-sm text-gray-500">Pedidos</p>
                    <p className="text-xl font-bold">{cashRegister.summary?.totalOrders || 0}</p>
                  </div>
                </div>

                <h3 className="text-sm font-medium mb-2">Desglose por Método de Pago</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt>Efectivo:</dt>
                    <dd className="font-medium">{formatCurrency(cashRegister.summary?.totalCash || 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Tarjeta:</dt>
                    <dd className="font-medium">{formatCurrency(cashRegister.summary?.totalCard || 0)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Otros métodos:</dt>
                    <dd className="font-medium">{formatCurrency(cashRegister.summary?.totalOtherMethods || 0)}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <dt>Impuestos:</dt>
                    <dd className="font-medium">{formatCurrency(cashRegister.summary?.totalTaxes || 0)}</dd>
                  </div>
                </dl>

                {cashRegister.summary?.paymentMethods && cashRegister.summary.paymentMethods.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-4">Distribución por Método de Pago</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cashRegister.summary.paymentMethods}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="method"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {cashRegister.summary.paymentMethods.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Ventas</CardTitle>
                <CardDescription>Distribución de ventas por hora</CardDescription>
              </CardHeader>
              <CardContent>
                {cashRegister.summary?.salesByHour && cashRegister.summary.salesByHour.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cashRegister.summary.salesByHour}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis tickFormatter={(value) => `${value}`} />
                        <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
                        <Bar dataKey="amount" fill="#3b82f6" name="Ventas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No hay datos de ventas por hora disponibles
                  </div>
                )}

                {cashRegister.summary?.ordersByStatus &&
                  Object.keys(cashRegister.summary.ordersByStatus).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-2">Pedidos por Estado</h3>
                      <dl className="space-y-2">
                        {Object.entries(cashRegister.summary.ordersByStatus).map(([status, count]) => (
                          <div key={status} className="flex justify-between">
                            <dt className="capitalize">{status}:</dt>
                            <dd className="font-medium">{count}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-4">No se encontró la información de la caja</p>
            <Button onClick={handleBack}>Volver</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
