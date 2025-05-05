"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params?.orderId as string
  const tenantId = params?.tenant as string

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !tenantId) {
        setError("Información de pedido no válida")
        setLoading(false)
        return
      }

      try {
        // CORREGIDO: Usar la ruta correcta para obtener el pedido
        const orderRef = ref(rtdb, `${tenantId}/orders/${orderId}`)
        console.log("Fetching order from path:", orderRef.toString())

        const orderSnapshot = await get(orderRef)

        if (!orderSnapshot.exists()) {
          setError("Pedido no encontrado")
          setLoading(false)
          return
        }

        setOrder({
          id: orderId,
          ...orderSnapshot.val(),
        })
      } catch (error) {
        console.error("Error al obtener el pedido:", error)
        setError("Error al cargar la información del pedido")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, tenantId])

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4">Cargando información del pedido...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
          <p className="text-muted-foreground">
            Tu pedido #{order.orderNumber} ha sido recibido y está siendo procesado.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Estado del Pedido</h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>
                  {order.status === "pending"
                    ? "Pendiente"
                    : order.status === "processing"
                      ? "En preparación"
                      : order.status === "ready"
                        ? "Listo para entrega"
                        : order.status === "completed"
                          ? "Completado"
                          : order.status === "cancelled"
                            ? "Cancelado"
                            : "Desconocido"}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Detalles del Pedido</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método de Pago</p>
                  <p>
                    {order.paymentMethod === "cash"
                      ? "Efectivo"
                      : order.paymentMethod === "card"
                        ? "Tarjeta"
                        : "Transferencia"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Pedido</p>
                  <p>
                    {order.type === "delivery"
                      ? "Entrega a Domicilio"
                      : order.type === "takeaway"
                        ? "Para Llevar"
                        : "Recoger en Local"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado de Pago</p>
                  <p>
                    {order.paymentStatus === "pending"
                      ? "Pendiente"
                      : order.paymentStatus === "completed"
                        ? "Completado"
                        : "Cancelado"}
                  </p>
                </div>
              </div>
            </div>

            {order.customerName && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Información de Contacto</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="text-sm text-muted-foreground">Nombre: </span>
                      {order.customerName}
                    </p>
                    <p>
                      <span className="text-sm text-muted-foreground">Teléfono: </span>
                      {order.customerPhone}
                    </p>
                    {order.customerEmail && (
                      <p>
                        <span className="text-sm text-muted-foreground">Email: </span>
                        {order.customerEmail}
                      </p>
                    )}
                    {order.customerAddress && (
                      <p>
                        <span className="text-sm text-muted-foreground">Dirección: </span>
                        {order.customerAddress}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="font-medium mb-2">Productos</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.productName}
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-xs text-muted-foreground ml-5">
                          {item.extras.map((extra, idx) => (
                            <div key={idx}>
                              {extra.quantity}x {extra.name} (+${extra.price.toFixed(2)})
                            </div>
                          ))}
                        </div>
                      )}
                      {item.notes && <div className="text-xs text-muted-foreground ml-5">Nota: {item.notes}</div>}
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Costo de envío</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/")} className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Si tienes alguna pregunta sobre tu pedido, por favor contáctanos al{" "}
          <a href="tel:+123456789" className="text-primary hover:underline">
            +123 456 789
          </a>
        </p>
      </div>
    </div>
  )
}
