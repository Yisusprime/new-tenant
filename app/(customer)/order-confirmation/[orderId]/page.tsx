"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ref, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, ArrowLeft } from "lucide-react"

interface OrderItem {
  productName: string
  quantity: number
  price: number
  extras: {
    name: string
    price: number
    quantity: number
  }[]
}

interface Order {
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  customerAddress: string | null
  type: string
  items: OrderItem[]
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  paymentMethod: string
  paymentStatus: string
  createdAt: number
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const orderId = params?.orderId as string
  const tenantId = params?.tenant as string

  useEffect(() => {
    if (!orderId || !tenantId) {
      setError("Información de pedido no válida")
      setLoading(false)
      return
    }

    const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)

    const handleOrderChange = (snapshot: any) => {
      if (snapshot.exists()) {
        setOrder(snapshot.val())
      } else {
        setError("Pedido no encontrado")
      }
      setLoading(false)
    }

    onValue(orderRef, handleOrderChange)

    return () => {
      off(orderRef, "value", handleOrderChange)
    }
  }, [orderId, tenantId])

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

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
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p>Cargando información del pedido...</p>
          </CardContent>
        </Card>
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
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Detalles del Pedido</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número de Pedido:</span>
                  <span>{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {order.status === "pending" ? "Pendiente" : order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de Entrega:</span>
                  <span>{getDeliveryMethodText(order.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de Pago:</span>
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
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
                {order.customerAddress && (
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
            <h3 className="font-medium mb-2">Productos</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  {item.extras && item.extras.length > 0 && (
                    <div className="pl-4 space-y-1 mt-1">
                      {item.extras.map((extra, extraIndex) => (
                        <div key={extraIndex} className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {extra.quantity}x {extra.name}
                          </span>
                          <span>{formatCurrency(extra.price * extra.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuestos</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Costo de envío</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
