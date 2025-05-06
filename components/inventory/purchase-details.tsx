"use client"

import type { Purchase } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface PurchaseDetailsProps {
  purchase: Purchase
  onClose: () => void
}

export function PurchaseDetails({ purchase, onClose }: PurchaseDetailsProps) {
  // Función para obtener el texto del estado en español
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado"
      case "partial":
        return "Parcial"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  // Función para obtener el texto del estado de pago en español
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado"
      case "partial":
        return "Parcial"
      default:
        return "Pendiente"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Proveedor</h3>
          <p className="text-lg font-semibold">{purchase.supplierName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Fecha de pedido</h3>
          <p className="text-lg font-semibold">{format(purchase.orderDate, "dd MMMM yyyy", { locale: es })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Estado</h3>
          <Badge
            className="mt-1"
            variant={
              purchase.status === "delivered"
                ? "success"
                : purchase.status === "partial"
                  ? "warning"
                  : purchase.status === "cancelled"
                    ? "destructive"
                    : "outline"
            }
          >
            {getStatusText(purchase.status)}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Estado de pago</h3>
          <Badge
            className="mt-1"
            variant={
              purchase.paymentStatus === "paid"
                ? "success"
                : purchase.paymentStatus === "partial"
                  ? "warning"
                  : "outline"
            }
          >
            {getPaymentStatusText(purchase.paymentStatus)}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Método de pago</h3>
          <p>{purchase.paymentMethod || "No especificado"}</p>
        </div>
      </div>

      {purchase.deliveryDate && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Fecha de entrega</h3>
          <p>{format(purchase.deliveryDate, "dd MMMM yyyy", { locale: es })}</p>
        </div>
      )}

      {purchase.notes && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
          <p className="text-sm">{purchase.notes}</p>
        </div>
      )}

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Ítems</h3>
        <div className="space-y-3">
          {purchase.items.map((item, index) => (
            <Card key={index}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">{item.ingredientName}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cantidad</p>
                    <p className="font-medium">
                      {item.quantity} {item.unit}
                      {item.received !== undefined && (
                        <span className="ml-2 text-xs">
                          (Recibido: {item.received} {item.unit})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Precio unitario</p>
                    <p className="font-medium">${item.unitCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">${item.totalCost.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">Total: ${purchase.totalAmount.toFixed(2)}</div>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  )
}
