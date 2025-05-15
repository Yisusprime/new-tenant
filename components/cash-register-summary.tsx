"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { getCashRegisterSummary } from "@/lib/services/cash-register-service"
import type { CashRegisterSummary as CashRegisterSummaryType } from "@/lib/types/cash-register"
import { ArrowDownCircle, ArrowUpCircle, DollarSign, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CashRegisterSummaryProps {
  tenantId: string
  branchId: string
  registerId: string
}

// Definimos el componente con ambos nombres para mantener compatibilidad
export function CashRegisterSummary({ tenantId, branchId, registerId }: CashRegisterSummaryProps) {
  const [summary, setSummary] = useState<CashRegisterSummaryType | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await getCashRegisterSummary(tenantId, branchId, registerId)
      setSummary(data)
    } catch (error) {
      console.error("Error al cargar resumen:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [tenantId, branchId, registerId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Resumen de Caja</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error al cargar el resumen de caja</p>
        <Button variant="outline" size="sm" onClick={loadSummary} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Resumen de Caja</h3>
        <Button variant="outline" size="sm" onClick={loadSummary}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Balance Actual</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.actualBalance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Total Ingresos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome + summary.totalSales + summary.totalDeposits)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
              <CardTitle className="text-base">Total Egresos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense + summary.totalRefunds + summary.totalWithdrawals)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalSales)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reembolsos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">{formatCurrency(summary.totalRefunds)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ajustes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(summary.totalAdjustments)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h4 className="text-base font-medium mb-3">Totales por Método de Pago</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Efectivo</p>
              <p className="text-lg font-bold">{formatCurrency(summary.paymentMethodTotals.cash)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Tarjeta</p>
              <p className="text-lg font-bold">{formatCurrency(summary.paymentMethodTotals.card)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">Transferencia</p>
              <p className="text-lg font-bold">{formatCurrency(summary.paymentMethodTotals.transfer)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">App de Pago</p>
              <p className="text-lg font-bold">{formatCurrency(summary.paymentMethodTotals.app)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Exportamos también como CashRegisterSummaryComponent para mantener compatibilidad
export const CashRegisterSummaryComponent = CashRegisterSummary

// Exportación predeterminada
export default CashRegisterSummary
