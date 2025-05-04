import { formatCurrency } from "@/lib/utils"

interface OrderSummaryByPaymentProps {
  cashTotal: number
  cardTotal: number
  transferTotal: number
  otherTotal: number
}

export function OrderSummaryByPayment({ cashTotal, cardTotal, transferTotal, otherTotal }: OrderSummaryByPaymentProps) {
  // Ensure all values are numbers
  const cash = Number.parseFloat(cashTotal as any) || 0
  const card = Number.parseFloat(cardTotal as any) || 0
  const transfer = Number.parseFloat(transferTotal as any) || 0
  const other = Number.parseFloat(otherTotal as any) || 0

  const total = cash + card + transfer + other

  // Calculate percentages
  const cashPercent = total > 0 ? (cash / total) * 100 : 0
  const cardPercent = total > 0 ? (card / total) * 100 : 0
  const transferPercent = total > 0 ? (transfer / total) * 100 : 0
  const otherPercent = total > 0 ? (other / total) * 100 : 0

  if (total === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-md text-center">
        <h3 className="font-medium mb-2">Resumen de Ventas por Método de Pago</h3>
        <p className="text-muted-foreground">No hay ventas registradas en esta sesión</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-medium mb-4">Resumen de Ventas por Método de Pago</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Efectivo</span>
            <span>{formatCurrency(cash)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${cashPercent}%` }}></div>
          </div>
          <div className="text-xs text-right mt-1">{cashPercent.toFixed(1)}% del total</div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Tarjeta</span>
            <span>{formatCurrency(card)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${cardPercent}%` }}></div>
          </div>
          <div className="text-xs text-right mt-1">{cardPercent.toFixed(1)}% del total</div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Transferencia</span>
            <span>{formatCurrency(transfer)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${transferPercent}%` }}></div>
          </div>
          <div className="text-xs text-right mt-1">{transferPercent.toFixed(1)}% del total</div>
        </div>

        {other > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span>Otros</span>
              <span>{formatCurrency(other)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${otherPercent}%` }}></div>
            </div>
            <div className="text-xs text-right mt-1">{otherPercent.toFixed(1)}% del total</div>
          </div>
        )}

        <div className="pt-2 border-t flex justify-between font-medium">
          <span>Total de ventas:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
