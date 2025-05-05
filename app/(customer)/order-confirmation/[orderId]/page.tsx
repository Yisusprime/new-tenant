"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, Clock, Home, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !user?.tenantId) {
        setError("No se pudo encontrar la información del pedido")
        setLoading(false)
        return
      }

      try {
        const orderRef = ref(rtdb, `tenants/${user.tenantId}/orders/${orderId}`)
        const snapshot = await get(orderRef)

        if (snapshot.exists()) {
          setOrder(snapshot.val())
        } else {
          setError("No se encontró el pedido")
        }
      } catch (err) {
        console.error("Error al obtener el pedido:", err)
        setError("Error al cargar la información del pedido")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, user?.tenantId])

  const getDeliveryMethodText = (type: string) => {
    switch (type) {
      case "dine-in":
        return "Recoger en el Local"
      case "takeaway":
        return "Para Llevar"
      case "delivery":
        return "Entrega a Domicilio"
      default:
        return type
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "Efectivo"
      case "card":
        return "Tarjeta de Crédito/Débito"
      case "transfer":
        return "Transferencia Bancaria"
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error || "No se pudo cargar la información del pedido"}</p>
            <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
          <p className="text-muted-foreground">
            Tu pedido #{order.orderNumber} ha sido recibido y está siendo procesado.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <p>
              Pedido realizado el{" "}
              {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Detalles del Pedido</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de entrega:</span>
                  <span>{getDeliveryMethodText(order.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de pago:</span>
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
                {order.needsChange && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cambio de:</span>
                    <span>
                      {formatCurrency(order.changeAmount)} a {formatCurrency(order.total)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Información de Contacto</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span>{order.customerPhone}</span>
                </div>
                {order.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                {order.type === "delivery" && order.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dirección:</span>
                    <span>{order.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Resumen del Pedido</h3>
            <div className="space-y-4">
              {/* Lista de productos */}
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <div>
                        {item.quantity}x {item.productName}
                      </div>
                      {item.extras && item.extras.length > 0 && (
                        <div className="pl-4 text-sm text-muted-foreground">
                          {item.extras.map((extra: any, idx: number) => (
                            <div key={idx}>
                              {extra.quantity}x {extra.name} (+{formatCurrency(extra.price * extra.quantity)})
                            </div>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <div className="pl-4 text-sm text-muted-foreground italic">Nota: {item.notes}</div>
                      )}
                    </div>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totales */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos (10%)</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>

                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Costo de envío</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}

                <Separator className="my-2" />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div>
              <h3 className="font-medium mb-2">Notas Adicionales</h3>
              <div className="bg-muted p-3 rounded-md text-sm">{order.notes}</div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
          <Button variant="default" onClick={() => router.push("/menu")}>
            <Home className="mr-2 h-4 w-4" />
            Explorar Menú
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
