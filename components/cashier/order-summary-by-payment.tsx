"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface OrderSummaryByPaymentProps {
  cashTotal: number
  cardTotal: number
  transferTotal: number
  otherTotal: number
}

export function OrderSummaryByPayment({ cashTotal, cardTotal, transferTotal, otherTotal }: OrderSummaryByPaymentProps) {
  // Asegurarse de que todos los valores sean números
  const cash = Number.parseFloat(String(cashTotal)) || 0
  const card = Number.parseFloat(String(cardTotal)) || 0
  const transfer = Number.parseFloat(String(transferTotal)) || 0
  const other = Number.parseFloat(String(otherTotal)) || 0

  // Calcular el total
  const total = cash + card + transfer + other

  // Calcular porcentajes (evitar división por cero)
  const cashPercent = total > 0 ? (cash / total) * 100 : 0
  const cardPercent = total > 0 ? (card / total) * 100 : 0
  const transferPercent = total > 0 ? (transfer / total) * 100 : 0
  const otherPercent = total > 0 ? (other / total) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Resumen de Ventas por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Total de ventas:</div>
              <div className="text-right font-bold">{formatCurrency(total)}</div>
            </div>

            <div className="space-y-2">
              {cash > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <div>Efectivo:</div>
                  <div className="text-right">{formatCurrency(cash)}</div>
                  <div className="text-right text-muted-foreground">{cashPercent.toFixed(1)}%</div>
                </div>
              )}

              {card > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <div>Tarjeta:</div>
                  <div className="text-right">{formatCurrency(card)}</div>
                  <div className="text-right text-muted-foreground">{cardPercent.toFixed(1)}%</div>
                </div>
              )}

              {transfer > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <div>Transferencia:</div>
                  <div className="text-right">{formatCurrency(transfer)}</div>
                  <div className="text-right text-muted-foreground">{transferPercent.toFixed(1)}%</div>
                </div>
              )}

              {other > 0 && (
                <div className="grid grid-cols-3 gap-2 text-sm items-center">
                  <div>Otros:</div>
                  <div className="text-right">{formatCurrency(other)}</div>
                  <div className="text-right text-muted-foreground">{otherPercent.toFixed(1)}%</div>
                </div>
              )}
            </div>

            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              {cash > 0 && (
                <div
                  className="h-full bg-green-500 float-left"
                  style={{ width: `${cashPercent}%` }}
                  title={`Efectivo: ${cashPercent.toFixed(1)}%`}
                ></div>
              )}
              {card > 0 && (
                <div
                  className="h-full bg-blue-500 float-left"
                  style={{ width: `${cardPercent}%` }}
                  title={`Tarjeta: ${cardPercent.toFixed(1)}%`}
                ></div>
              )}
              {transfer > 0 && (
                <div
                  className="h-full bg-purple-500 float-left"
                  style={{ width: `${transferPercent}%` }}
                  title={`Transferencia: ${transferPercent.toFixed(1)}%`}
                ></div>
              )}
              {other > 0 && (
                <div
                  className="h-full bg-gray-500 float-left"
                  style={{ width: `${otherPercent}%` }}
                  title={`Otros: ${otherPercent.toFixed(1)}%`}
                ></div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No hay ventas registradas en esta sesión</div>
        )}
      </CardContent>
    </Card>
  )
}
