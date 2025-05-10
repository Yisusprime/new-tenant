"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth } from "firebase/auth"
import { ArrowLeft, Package, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para órdenes
const mockOrders = [
  {
    id: "ORD-1234",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
    status: "en-proceso",
    items: [
      { name: "Hamburguesa Clásica", quantity: 1, price: 8.99 },
      { name: "Papas Fritas", quantity: 1, price: 3.5 },
      { name: "Refresco Cola", quantity: 1, price: 2.5 },
    ],
    total: 14.99,
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // 15 minutos en el futuro
  },
  {
    id: "ORD-1233",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 día atrás
    status: "entregado",
    items: [
      { name: "Pizza Margherita", quantity: 1, price: 12.99 },
      { name: "Ensalada César", quantity: 1, price: 6.5 },
      { name: "Agua Mineral", quantity: 2, price: 1.5 },
    ],
    total: 22.49,
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 horas atrás
  },
]

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar si el usuario está autenticado
      const user = auth.currentUser

      if (!user) {
        // Si no está autenticado, redirigir a login
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (!user) {
            router.push("/menu/login?redirect=orders")
          } else {
            // Simular carga de órdenes
            setTimeout(() => {
              setOrders(mockOrders)
              setIsLoading(false)
            }, 1000)
          }
        })

        return () => unsubscribe()
      } else {
        // Simular carga de órdenes
        setTimeout(() => {
          setOrders(mockOrders)
          setIsLoading(false)
        }, 1000)
      }
    }

    checkAuth()
  }, [auth, router])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "en-proceso":
        return <Badge className="bg-amber-500">En proceso</Badge>
      case "en-camino":
        return <Badge className="bg-blue-500">En camino</Badge>
      case "entregado":
        return <Badge className="bg-green-500">Entregado</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8 pb-20">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/menu")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Mis Pedidos</h1>
      </div>

      {isLoading ? (
        // Skeleton loader
        <>
          <Skeleton className="w-full h-40 mb-4 rounded-lg" />
          <Skeleton className="w-full h-40 rounded-lg" />
        </>
      ) : orders.length > 0 ? (
        // Lista de órdenes
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <CardDescription>{formatDate(order.date)}</CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                {order.status === "en-proceso" ? (
                  <div className="w-full flex items-center text-sm text-amber-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Entrega estimada: {formatDate(order.estimatedDelivery)}</span>
                  </div>
                ) : order.status === "entregado" ? (
                  <div className="w-full flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Entregado: {formatDate(order.deliveredAt)}</span>
                  </div>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Sin órdenes
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes pedidos</h3>
          <p className="text-gray-500 mb-4">Cuando realices un pedido, aparecerá aquí</p>
          <Button onClick={() => router.push("/menu")}>Ver menú</Button>
        </div>
      )}
    </div>
  )
}
