"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, DollarSign, Banknote, MoreHorizontal } from "lucide-react"

interface OrderSummaryByPaymentProps {
  cashTotal: number
  cardTotal: number
  transferTotal: number
  otherTotal: number
}

export function OrderSummaryByPayment({ cashTotal, cardTotal, transferTotal, otherTotal }: OrderSummaryByPaymentProps) {
  const total = cashTotal + cardTotal + transferTotal + otherTotal

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Resumen de Ventas por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col p-3 bg-green-50 rounded-md border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Efectivo</span>
              <Banknote className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-lg font-bold text-green-800">{formatCurrency(cashTotal)}</span>
            <span className="text-xs text-green-600 mt-1">
              {total > 0 ? `${Math.round((cashTotal / total) * 100)}% del total` : "0% del total"}
            </span>
          </div>

          <div className="flex flex-col p-3 bg-blue-50 rounded-md border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Tarjeta</span>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-lg font-bold text-blue-800">{formatCurrency(cardTotal)}</span>
            <span className="text-xs text-blue-600 mt-1">
              {total > 0 ? `${Math.round((cardTotal / total) * 100)}% del total` : "0% del total"}
            </span>
          </div>

          <div className="flex flex-col p-3 bg-purple-50 rounded-md border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-800">Transferencia</span>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-lg font-bold text-purple-800">{formatCurrency(transferTotal)}</span>
            <span className="text-xs text-purple-600 mt-1">
              {total > 0 ? `${Math.round((transferTotal / total) * 100)}% del total` : "0% del total"}
            </span>
          </div>

          <div className="flex flex-col p-3 bg-gray-50 rounded-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Otros</span>
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">{formatCurrency(otherTotal)}</span>
            <span className="text-xs text-gray-600 mt-1">
              {total > 0 ? `${Math.round((otherTotal / total) * 100)}% del total` : "0% del total"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex justify-between items-center">
          <span className="font-medium">Total de ventas:</span>
          <span className="text-lg font-bold">{formatCurrency(total)}</span>
        </div>

        {total === 0 && (
          <div className="mt-2 text-center text-sm text-gray-500">No hay ventas registradas en esta sesión</div>
        )}
      </CardContent>
    </Card>
  )
}
