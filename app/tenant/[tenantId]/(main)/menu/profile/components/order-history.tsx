"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { formatCurrency } from "../utils/format-currency"
import { formatDate } from "../utils/format-date"

interface OrderHistoryProps {
  tenantId: string
  userId: string
}

export function OrderHistory({ tenantId, userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const ordersRef = collection(db, `tenants/${tenantId}/orders`)
        const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))

        setOrders(ordersData)
      } catch (error) {
        console.error("Error al cargar los pedidos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [tenantId, userId])

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
      pending: { label: "Pendiente", variant: "outline" },
      processing: { label: "En proceso", variant: "secondary" },
      completed: { label: "Completado", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }

    const statusInfo = statusMap[status] || { label: status, variant: "outline" }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-4">No tienes pedidos realizados</p>
          <Button asChild>
            <a href="./menu">Explorar menú</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Collapsible key={order.id} open={expandedOrder === order.id} onOpenChange={() => toggleOrderExpand(order.id)}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">Pedido #{order.orderNumber || order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <span className="font-medium">{formatCurrency(order.total || 0)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center justify-between w-full">
                  <span>Ver detalles</span>
                  {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Productos</h4>
                  <ul className="space-y-2">
                    {order.items?.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                          {item.options && item.options.length > 0 && (
                            <ul className="ml-6 text-sm text-gray-500">
                              {item.options.map((option: any, idx: number) => (
                                <li key={idx}>
                                  {option.name}: {option.value}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-1">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal || 0)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between mb-1">
                      <span>Envío</span>
                      <span>{formatCurrency(order.deliveryFee || 0)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between mb-1 text-green-600">
                      <span>Descuento</span>
                      <span>-{formatCurrency(order.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(order.total || 0)}</span>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Dirección de entrega</h4>
                    <p>
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </p>
                    {order.deliveryAddress.instructions && (
                      <p className="text-sm text-gray-500 mt-1">Instrucciones: {order.deliveryAddress.instructions}</p>
                    )}
                  </div>
                )}

                {order.paymentMethod && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Método de pago</h4>
                    <p>
                      {order.paymentMethod.type === "card"
                        ? `Tarjeta terminada en ${order.paymentMethod.last4}`
                        : order.paymentMethod.type}
                    </p>
                  </div>
                )}

                {order.status !== "cancelled" && order.status !== "completed" && (
                  <div className="border-t pt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Cancelar pedido
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}
