import { formatCurrency } from "@/lib/utils"

interface OrderSummaryByPaymentProps {
  cashTotal: number
  cardTotal: number
  transferTotal: number
  otherTotal: number
}

export function OrderSummaryByPayment({ cashTotal, cardTotal, transferTotal, otherTotal }: OrderSummaryByPaymentProps) {
  const totalSales = cashTotal + cardTotal + transferTotal + otherTotal

  // Calcular porcentajes (evitar división por cero)
  const cashPercentage = totalSales > 0 ? (cashTotal / totalSales) * 100 : 0
  const cardPercentage = totalSales > 0 ? (cardTotal / totalSales) * 100 : 0
  const transferPercentage = totalSales > 0 ? (transferTotal / totalSales) * 100 : 0
  const otherPercentage = totalSales > 0 ? (otherTotal / totalSales) * 100 : 0

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resumen de Ventas por Método de Pago</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 p-4 rounded-md lg:col-span-1">
          <div className="text-sm text-blue-600">Total de ventas:</div>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-md">
          <div className="text-sm text-green-600">Efectivo:</div>
          <div className="text-xl font-bold">{formatCurrency(cashTotal)}</div>
          <div className="text-sm">{cashPercentage.toFixed(1)}%</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-md">
          <div className="text-sm text-orange-600">Tarjeta:</div>
          <div className="text-xl font-bold">{formatCurrency(cardTotal)}</div>
          <div className="text-sm">{cardPercentage.toFixed(1)}%</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-md">
          <div className="text-sm text-purple-600">Transferencia:</div>
          <div className="text-xl font-bold">{formatCurrency(transferTotal)}</div>
          <div className="text-sm">{transferPercentage.toFixed(1)}%</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="text-sm text-gray-600">Otros:</div>
          <div className="text-xl font-bold">{formatCurrency(otherTotal)}</div>
          <div className="text-sm">{otherPercentage.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}
