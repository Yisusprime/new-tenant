"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Utensils, Heart, Clock, Star } from "lucide-react"
import LoadingScreen from "@/components/loading-screen"

export default function ClientDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [recentOrders, setRecentOrders] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "client")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  // Aquí podrías cargar datos específicos para el dashboard de cliente
  useEffect(() => {
    // Simulación de carga de datos
    setRecentOrders([
      { id: 3001, date: "2023-05-01", items: 3, total: 28.5, status: "delivered" },
      { id: 3002, date: "2023-04-25", items: 2, total: 18.75, status: "delivered" },
    ])

    setFavoriteItems([
      { id: 101, name: "Pizza Margherita", price: 12.5 },
      { id: 102, name: "Hamburguesa Clásica", price: 9.95 },
      { id: 103, name: "Ensalada César", price: 8.5 },
    ])
  }, [])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mi Cuenta</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bienvenido, {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Historial de tus últimos pedidos</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No has realizado ningún pedido aún</p>
                  <Button className="mt-4">Ver Menú</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">Pedido #{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.date} • {order.items} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{order.total.toFixed(2)}</p>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="outline">Ver Todos los Pedidos</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tus Favoritos</CardTitle>
              <CardDescription>Platos que has marcado como favoritos</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes favoritos guardados</p>
                  <Button className="mt-4">Explorar Menú</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favoriteItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-muted rounded-md mr-3 flex items-center justify-center">
                          <Utensils className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{item.price.toFixed(2)}</p>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Añadir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Realizar Nuevo Pedido</CardTitle>
              <CardDescription>Elige entre nuestras opciones</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button variant="outline" className="h-24 flex flex-col">
                <Utensils className="h-8 w-8 mb-2" />
                <span>Ver Menú</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <Clock className="h-8 w-8 mb-2" />
                <span>Pedido Rápido</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col">
                <Heart className="h-8 w-8 mb-2" />
                <span>Mis Favoritos</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Nombre:</span> {userProfile.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {userProfile.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Teléfono:</span> No configurado
                </p>
                <p className="text-sm">
                  <span className="font-medium">Dirección:</span> No configurada
                </p>
                <Button variant="outline" className="w-full mt-4">
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones para ti</CardTitle>
            <CardDescription>Basado en tus pedidos anteriores</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardContent className="p-4">
                  <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium">Plato Recomendado #{item}</h3>
                  <div className="flex items-center mt-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">4.0</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Descripción del plato recomendado...</p>
                  <Button size="sm" className="w-full">
                    Añadir al Carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
