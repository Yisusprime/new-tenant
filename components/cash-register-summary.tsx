"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { DollarSign, FileText } from "lucide-react"

export function CashRegisterSummary({ tenantId, branchId }: { tenantId: string; branchId: string }) {
  const { currentCashRegister, isOpen, isLoading, error } = useCashRegister()
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  // Función para abrir el diálogo de apertura de caja
  const handleOpenCashRegister = () => {
    setOpenDialogOpen(true)
  }

  // Función para abrir el diálogo de cierre de caja
  const handleCloseCashRegister = () => {
    setCloseDialogOpen(true)
  }

  if (isLoading) {
    return (
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
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Ocurrió un error al cargar la información de la caja</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error.message}</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen || !currentCashRegister) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay caja abierta</CardTitle>
          <CardDescription>
            Actualmente no hay ninguna caja abierta. Abre una caja para comenzar a registrar ventas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenCashRegister}>Abrir Caja</Button>
        </CardContent>
      </Card>
    )
  }

  return (
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

          <Button className="w-full mt-4" onClick={handleCloseCashRegister}>
            Cerrar Caja
          </Button>
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
              <p className="text-xl font-bold">{formatCurrency(currentCashRegister.summary?.totalSales || 0)}</p>
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
                <dd className="text-sm font-medium">{formatCurrency(currentCashRegister.summary?.totalCash || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm">Tarjeta:</dt>
                <dd className="text-sm font-medium">{formatCurrency(currentCashRegister.summary?.totalCard || 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm">Otros métodos:</dt>
                <dd className="text-sm font-medium">
                  {formatCurrency(currentCashRegister.summary?.totalOtherMethods || 0)}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
