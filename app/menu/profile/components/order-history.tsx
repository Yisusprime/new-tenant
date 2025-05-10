"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export function OrderHistory({ tenantId, userId }: { tenantId: string; userId: string }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, `tenants/${tenantId}/orders`)
        const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setOrders(ordersData)
      } catch (error) {
        console.error("Error al obtener los pedidos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && userId) {
      fetchOrders()
    }
  }, [tenantId, userId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            En proceso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No tienes pedidos anteriores</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {orders.map((order) => (
          <AccordionItem key={order.id} value={order.id}>
            <AccordionTrigger className="px-4 py-2 bg-gray-50 rounded-t-md hover:bg-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                <div className="font-medium">Pedido #{order.id.slice(-6)}</div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-gray-500">
                  <div>{formatDate(order.createdAt)}</div>
                  <div>{formatCurrency(order.total)}</div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2 border border-t-0 border-gray-200 rounded-b-md">
              <div className="space-y-4 py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Productos</h4>
                  <ul className="space-y-2">
                    {order.items.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {item.quantity} x {item.name}
                          {item.options && item.options.length > 0 && (
                            <span className="text-sm text-gray-500">
                              {" "}
                              ({item.options.map((opt: any) => opt.value).join(", ")})
                            </span>
                          )}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Impuestos</span>
                      <span>{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span>{formatCurrency(order.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Dirección de entrega</h4>
                    <p>{order.deliveryAddress}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Notas</h4>
                    <p>{order.notes}</p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
