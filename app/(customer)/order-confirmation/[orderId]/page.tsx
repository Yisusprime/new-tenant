"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Home, ArrowLeft, XCircle } from "lucide-react"
import Link from "next/link"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const orderId = params?.orderId as string
  const tenantId = (params?.tenant as string) || ""

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId || !tenantId) {
          setError("Información de pedido no válida")
          setLoading(false)
          return
        }

        // CORREGIDO: Ruta correcta para las órdenes
        const orderRef = ref(rtdb, `${tenantId}/orders/${orderId}`)
        console.log("Fetching order from path:", orderRef.toString())

        const snapshot = await get(orderRef)

        if (snapshot.exists()) {
          setOrder({ id: orderId, ...snapshot.val() })
        } else {
          setError("Pedido no encontrado")
        }
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Error al cargar el pedido")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, tenantId])

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Cargando pedido...</CardTitle>
            <CardDescription>Estamos obteniendo la información de tu pedido</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
              <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "No se pudo cargar el pedido"}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const getStatusInfo = () => {
    switch (order.status) {
      case "pending":
        return {
          title: "Pedido recibido",
          description: "Tu pedido ha sido recibido y está siendo procesado",
          icon: <Clock className="h-12 w-12 text-amber-500" />,
          color: "text-amber-500",
        }
      case "processing":
        return {
          title: "Pedido en preparación",
          description: "Tu pedido está siendo preparado",
          icon: <Clock className="h-12 w-12 text-blue-500" />,
          color: "text-blue-500",
        }
      case "completed":
        return {
          title: "Pedido completado",
          description: "Tu pedido ha sido completado",
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          color: "text-green-500",
        }
      case "cancelled":
        return {
          title: "Pedido cancelado",
          description: "Tu pedido ha sido cancelado",
          icon: <XCircle className="h-12 w-12 text-red-500" />,
          color: "text-red-500",
        }
      default:
        return {
          title: "Pedido recibido",
          description: "Tu pedido ha sido recibido",
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          color: "text-green-500",
        }
    }
  }

  const statusInfo = getStatusInfo()
  const orderDate = new Date(order.createdAt)
  const formattedDate = orderDate.toLocaleDateString()
  const formattedTime = orderDate.toLocaleTimeString()
  const timeAgo = formatDistanceToNow(orderDate, { addSuffix: true, locale: es })

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <div className="flex items-center mb-6">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{statusInfo.icon}</div>
          <CardTitle className={`text-2xl ${statusInfo.color}`}>{statusInfo.title}</CardTitle>
          <CardDescription className="text-base">{statusInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Número de pedido</p>
            <p className="text-xl font-bold">{order.orderNumber || order.id.slice(0, 8)}</p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Detalles del pedido</h3>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {formattedDate} a las {formattedTime}
            </p>
            <div className="flex items-center text-sm">
              <Home className="h-4 w-4 mr-2" />
              <span>
                {order.type === "delivery"
                  ? "Entrega a domicilio"
                  : order.type === "pickup"
                    ? "Recoger en tienda"
                    : "Consumo en local"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Resumen</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.productName}
                    {item.extras && item.extras.length > 0 && (
                      <div className="text-xs text-muted-foreground ml-5">
                        {item.extras.map((extra, i) => (
                          <div key={i}>
                            {extra.quantity}x {extra.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {order.type === "delivery" && (
            <div>
              <h3 className="font-medium mb-2">Información de entrega</h3>
              <p className="text-sm">{order.customerAddress}</p>
              {order.deliveryNotes && <p className="text-sm text-muted-foreground mt-1">{order.deliveryNotes}</p>}
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Información de contacto</h3>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm">{order.customerPhone}</p>
            {order.customerEmail && <p className="text-sm">{order.customerEmail}</p>}
          </div>

          {order.notes && (
            <div>
              <h3 className="font-medium mb-2">Notas adicionales</h3>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
