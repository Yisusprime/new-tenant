"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranch } from "@/lib/context/branch-context"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { CashRegisterStatus } from "@/components/cash-register-status"
import { getCashRegisters } from "@/lib/services/cash-register-service"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { CashRegister } from "@/lib/types/cash-register"
import { Clock, DollarSign, FileText } from "lucide-react"

export default function CashRegisterPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const { currentCashRegister, isOpen } = useCashRegister()
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadCashRegisters() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const registers = await getCashRegisters(tenantId, currentBranch.id)
        setCashRegisters(registers)
      } catch (error) {
        console.error("Error al cargar el historial de cajas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCashRegisters()
  }, [tenantId, currentBranch, isOpen])

  const handleViewDetails = (cashRegisterId: string) => {
    router.push(`/tenant/${tenantId}/admin/cash-register/${cashRegisterId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Caja Registradora</h1>
        {currentBranch && <CashRegisterStatus tenantId={tenantId} branchId={currentBranch.id} />}
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Caja Actual</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : isOpen && currentCashRegister ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Caja</CardTitle>
                    <CardDescription>Detalles de la caja actual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Estado:</dt>
                        <dd>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Abierta
                          </Badge>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Apertura:</dt>
                        <dd>{formatDateTime(currentCashRegister.openedAt)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Monto Inicial:</dt>
                        <dd>{formatCurrency(currentCashRegister.initialAmount)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Ventas en Efectivo:</dt>
                        <dd>{formatCurrency(currentCashRegister.summary?.totalCash || 0)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Total en Caja (Esperado):</dt>
                        <dd className="font-bold">
                          {formatCurrency(
                            (currentCashRegister.initialAmount || 0) + (currentCashRegister.summary?.totalCash || 0),
                          )}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumen de Ventas</CardTitle>
                    <CardDescription>Ventas registradas desde la apertura</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-gray-500">Total Ventas</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(currentCashRegister.summary?.totalSales || 0)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-500 mb-2" />
                        <p className="text-sm text-gray-500">Pedidos</p>
                        <p className="text-xl font-bold">{currentCashRegister.summary?.totalOrders || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Desglose por Método de Pago</h4>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-sm">Efectivo:</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(currentCashRegister.summary?.totalCash || 0)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm">Tarjeta:</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(currentCashRegister.summary?.totalCard || 0)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm">Otros métodos:</dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(currentCashRegister.summary?.totalOtherMethods || 0)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <Button className="w-full mt-4" onClick={() => handleViewDetails(currentCashRegister.id)}>
                      Ver Detalles Completos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No hay caja abierta</CardTitle>
                  <CardDescription>
                    Actualmente no hay ninguna caja abierta. Abre una caja para comenzar a registrar ventas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => document.querySelector<HTMLButtonElement>("[data-open-cash-register]")?.click()}
                  >
                    Abrir Caja
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Cajas</CardTitle>
                <CardDescription>Registro de aperturas y cierres de caja</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : cashRegisters.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Ventas</TableHead>
                        <TableHead>Diferencia</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashRegisters.map((register) => (
                        <TableRow key={register.id}>
                          <TableCell>
                            <div className="font-medium">{formatDateTime(register.openedAt, "short")}</div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {register.status === "open"
                                ? "En curso"
                                : register.closedAt
                                  ? formatDateTime(register.closedAt, "time")
                                  : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={register.status === "open" ? "outline" : "secondary"}>
                              {register.status === "open" ? "Abierta" : "Cerrada"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(register.summary?.totalSales || 0)}
                            <div className="text-xs text-gray-500">{register.summary?.totalOrders || 0} pedidos</div>
                          </TableCell>
                          <TableCell>
                            {register.status === "closed" && register.difference !== undefined ? (
                              <span
                                className={
                                  register.difference < 0
                                    ? "text-red-600"
                                    : register.difference > 0
                                      ? "text-green-600"
                                      : ""
                                }
                              >
                                {register.difference === 0 ? "Sin diferencia" : formatCurrency(register.difference)}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(register.id)}>
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500">No hay registros de cajas anteriores</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
