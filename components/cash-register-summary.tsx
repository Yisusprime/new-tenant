"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { getOrdersByCashRegister } from "@/lib/services/order-service"
import type { Order } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"

export function CashRegisterSummary({
  tenantId,
  branchId,
}: {
  tenantId: string
  branchId: string
}) {
  const { currentCashRegister, isOpen, loading: cashRegisterLoading } = useCashRegister()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentCashRegister) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const ordersData = await getOrdersByCashRegister(tenantId, branchId, currentCashRegister.id)
        setOrders(ordersData || [])
      } catch (error) {
        console.error("Error al cargar pedidos:", error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [tenantId, branchId, currentCashRegister])

  if (cashRegisterLoading || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No hay una caja abierta</h3>
        <p className="text-muted-foreground">Abre una caja para ver el resumen de ventas</p>
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

  // Calcular pedidos por estado
  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const preparingOrders = orders.filter((order) => order.status === "preparing").length
  const readyOrders = orders.filter((order) => order.status === "ready").length
  const completedOrders = orders.filter((order) => order.status === "completed").length
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalOrders} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos en Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashPayments)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {orders.filter((order) => order.paymentMethod === "cash").length} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos con Tarjeta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cardPayments)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {orders.filter((order) => order.paymentMethod === "card").length} pedidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Otros Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(otherPayments)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {orders.filter((order) => order.paymentMethod !== "cash" && order.paymentMethod !== "card").length}{" "}
              pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado de Pedidos</CardTitle>
          <CardDescription>Resumen de pedidos por estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-2 bg-yellow-100 rounded-md">
              <div className="font-bold text-yellow-800">{pendingOrders}</div>
              <div className="text-xs text-yellow-800">Pendientes</div>
            </div>
            <div className="text-center p-2 bg-blue-100 rounded-md">
              <div className="font-bold text-blue-800">{preparingOrders}</div>
              <div className="text-xs text-blue-800">En Preparación</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded-md">
              <div className="font-bold text-green-800">{readyOrders}</div>
              <div className="text-xs text-green-800">Listos</div>
            </div>
            <div className="text-center p-2 bg-purple-100 rounded-md">
              <div className="font-bold text-purple-800">{completedOrders}</div>
              <div className="text-xs text-purple-800">Completados</div>
            </div>
            <div className="text-center p-2 bg-red-100 rounded-md">
              <div className="font-bold text-red-800">{cancelledOrders}</div>
              <div className="text-xs text-red-800">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Caja</CardTitle>
          <CardDescription>Detalles de la caja actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abierta por:</span>
              <span className="font-medium">{currentCashRegister?.openedBy || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha de apertura:</span>
              <span className="font-medium">
                {currentCashRegister?.openedAt ? new Date(currentCashRegister.openedAt).toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto inicial:</span>
              <span className="font-medium">{formatCurrency(currentCashRegister?.initialAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto actual estimado:</span>
              <span className="font-medium">
                {formatCurrency((currentCashRegister?.initialAmount || 0) + cashPayments)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
