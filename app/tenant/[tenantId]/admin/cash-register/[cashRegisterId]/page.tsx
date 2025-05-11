"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCashRegisterById } from "@/lib/services/cash-register-service"
import { getOrdersByCashRegister } from "@/lib/services/order-service"
import type { CashRegister } from "@/lib/types/cash-register"
import type { Order } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { useBranch } from "@/lib/context/branch-context"

export default function CashRegisterDetailsPage({
  params,
}: {
  params: { tenantId: string; cashRegisterId: string }
}) {
  const { tenantId, cashRegisterId } = params
  const { currentBranch } = useBranch()
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!currentBranch) return

      try {
        setLoading(true)

        // Cargar datos de la caja
        const cashRegisterData = await getCashRegisterById(tenantId, currentBranch.id, cashRegisterId)
        setCashRegister(cashRegisterData)

        // Cargar pedidos asociados a esta caja
        if (cashRegisterData) {
          const ordersData = await getOrdersByCashRegister(tenantId, currentBranch.id, cashRegisterId)
          setOrders(ordersData || [])
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (currentBranch) {
      loadData()
    }
  }, [tenantId, cashRegisterId, currentBranch])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!cashRegister) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Caja no encontrada</h3>
        <p className="text-muted-foreground">La caja solicitada no existe o no tienes permisos para verla</p>
        <Button asChild className="mt-4">
          <Link href="/admin/cash-register">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>
    )
  }

  // Calcular estadísticas
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const totalOrders = orders.length
  const cashPayments = orders
    .filter((order) => order.paymentMethod === "cash")
    .reduce((sum, order) => sum + (order.total || 0), 0)
  const cardPayments = orders
    .filter((order) => order.paymentMethod === "card")
    .reduce((sum, order) => sum + (order.total || 0), 0)
  const otherPayments = orders
    .filter((order) => order.paymentMethod !== "cash" && order.paymentMethod !== "card")
    .reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/cash-register">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Detalles de Caja</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Detalles de la caja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <span className={`font-medium ${cashRegister.status === "open" ? "text-green-600" : "text-gray-600"}`}>
                  {cashRegister.status === "open" ? "Abierta" : "Cerrada"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Abierta por:</span>
                <span className="font-medium">{cashRegister.openedBy || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de apertura:</span>
                <span className="font-medium">
                  {cashRegister.openedAt ? new Date(cashRegister.openedAt).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto inicial:</span>
                <span className="font-medium">{formatCurrency(cashRegister.initialAmount || 0)}</span>
              </div>
              {cashRegister.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Notas de apertura:</span>
                  <p className="mt-1 text-sm border p-2 rounded-md">{cashRegister.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {cashRegister.status === "closed" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cerrada por:</span>
                    <span className="font-medium">{cashRegister.closedBy || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de cierre:</span>
                    <span className="font-medium">
                      {cashRegister.closedAt ? new Date(cashRegister.closedAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto final:</span>
                    <span className="font-medium">{formatCurrency(cashRegister.finalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monto esperado:</span>
                    <span className="font-medium">{formatCurrency(cashRegister.expectedAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diferencia:</span>
                    <span
                      className={`font-medium ${
                        (cashRegister.finalAmount || 0) < (cashRegister.expectedAmount || 0)
                          ? "text-red-600"
                          : (cashRegister.finalAmount || 0) > (cashRegister.expectedAmount || 0)
                            ? "text-green-600"
                            : ""
                      }`}
                    >
                      {formatCurrency((cashRegister.finalAmount || 0) - (cashRegister.expectedAmount || 0))}
                    </span>
                  </div>
                  {cashRegister.closingNotes && (
                    <div className="pt-2">
                      <span className="text-muted-foreground">Notas de cierre:</span>
                      <p className="mt-1 text-sm border p-2 rounded-md">{cashRegister.closingNotes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Ventas</CardTitle>
          <CardDescription>Estadísticas de ventas para esta caja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Ventas Totales</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(totalSales)}</div>
              <div className="text-xs text-gray-500 mt-1">{totalOrders} pedidos</div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Pagos en Efectivo</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(cashPayments)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {orders.filter((order) => order.paymentMethod === "cash").length} pedidos
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Pagos con Tarjeta</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(cardPayments)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {orders.filter((order) => order.paymentMethod === "card").length} pedidos
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Otros Pagos</div>
              <div className="text-2xl font-bold mt-1">{formatCurrency(otherPayments)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {orders.filter((order) => order.paymentMethod !== "cash" && order.paymentMethod !== "card").length}{" "}
                pedidos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
          <CardDescription>Lista de pedidos realizados durante esta caja</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay pedidos registrados para esta caja</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Nº</th>
                    <th className="text-left py-2 px-4">Fecha</th>
                    <th className="text-left py-2 px-4">Cliente</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-right py-2 px-4">Total</th>
                    <th className="text-center py-2 px-4">Método de Pago</th>
                    <th className="text-center py-2 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{order.orderNumber}</td>
                      <td className="py-2 px-4">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="py-2 px-4">{order.customerName || "N/A"}</td>
                      <td className="py-2 px-4">
                        {order.orderType === "delivery"
                          ? "Delivery"
                          : order.orderType === "table"
                            ? "Mesa"
                            : "Mostrador"}
                      </td>
                      <td className="py-2 px-4 text-right">{formatCurrency(order.total || 0)}</td>
                      <td className="py-2 px-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                          {order.paymentMethod === "cash"
                            ? "Efectivo"
                            : order.paymentMethod === "card"
                              ? "Tarjeta"
                              : order.paymentMethod || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "preparing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "ready"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "completed"
                                    ? "bg-purple-100 text-purple-800"
                                    : order.status === "cancelled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status === "pending"
                            ? "Pendiente"
                            : order.status === "preparing"
                              ? "En Preparación"
                              : order.status === "ready"
                                ? "Listo"
                                : order.status === "completed"
                                  ? "Completado"
                                  : order.status === "cancelled"
                                    ? "Cancelado"
                                    : order.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
