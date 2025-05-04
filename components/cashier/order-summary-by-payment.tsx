import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface OrderSummaryByPaymentProps {
  cashTotal: number
  cardTotal: number
  transferTotal: number
  otherTotal: number
}

export function OrderSummaryByPayment({ cashTotal, cardTotal, transferTotal, otherTotal }: OrderSummaryByPaymentProps) {
  const totalSales = cashTotal + cardTotal + transferTotal + otherTotal

  // Calcular porcentajes
  const cashPercentage = totalSales > 0 ? (cashTotal / totalSales) * 100 : 0
  const cardPercentage = totalSales > 0 ? (cardTotal / totalSales) * 100 : 0
  const transferPercentage = totalSales > 0 ? (transferTotal / totalSales) * 100 : 0
  const otherPercentage = totalSales > 0 ? (otherTotal / totalSales) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen de Ventas por Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        {totalSales === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No hay ventas registradas en esta sesión</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <h3 className="font-medium">Efectivo</h3>
                <p className="text-2xl font-bold">{formatCurrency(cashTotal)}</p>
                <p className="text-sm text-muted-foreground">{cashPercentage.toFixed(1)}% del total</p>
              </div>
              <div>
                <h3 className="font-medium">Tarjeta</h3>
                <p className="text-2xl font-bold">{formatCurrency(cardTotal)}</p>
                <p className="text-sm text-muted-foreground">{cardPercentage.toFixed(1)}% del total</p>
              </div>
              <div>
                <h3 className="font-medium">Transferencia</h3>
                <p className="text-2xl font-bold">{formatCurrency(transferTotal)}</p>
                <p className="text-sm text-muted-foreground">{transferPercentage.toFixed(1)}% del total</p>
              </div>
              <div>
                <h3 className="font-medium">Otros</h3>
                <p className="text-2xl font-bold">{formatCurrency(otherTotal)}</p>
                <p className="text-sm text-muted-foreground">{otherPercentage.toFixed(1)}% del total</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Total de ventas:</h3>
                <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
