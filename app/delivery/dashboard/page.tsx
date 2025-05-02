"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, MapPin, CheckCircle, Clock, BarChart3 } from "lucide-react"
import LoadingScreen from "@/components/loading-screen"

export default function DeliveryDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [pendingDeliveries, setPendingDeliveries] = useState([])
  const [completedToday, setCompletedToday] = useState(0)
  const [earnings, setEarnings] = useState(0)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "delivery")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  // Aquí podrías cargar datos específicos para el dashboard de repartidor
  useEffect(() => {
    // Simulación de carga de datos
    setPendingDeliveries([
      { id: 2001, address: "Calle Principal 123", distance: "1.2 km", status: "ready", time: "10:30" },
      { id: 2002, address: "Avenida Central 45", distance: "2.5 km", status: "preparing", time: "10:45" },
    ])
    setCompletedToday(5)
    setEarnings(42.5)
  }, [])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard de Repartidor</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bienvenido, {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDeliveries.length}</div>
              <p className="text-xs text-muted-foreground">Asignados a ti</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday}</div>
              <p className="text-xs text-muted-foreground">Entregas realizadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ganancias Hoy (€)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Propinas incluidas</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Entregas Pendientes</CardTitle>
            <CardDescription>Pedidos asignados para entrega</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay entregas pendientes en este momento</p>
                <Button className="mt-4">Actualizar</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      {delivery.status === "ready" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium">Pedido #{delivery.id}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {delivery.address} • {delivery.distance} • {delivery.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" disabled={delivery.status !== "ready"}>
                      {delivery.status === "ready" ? "Iniciar Entrega" : "En Preparación"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapa de Entregas</CardTitle>
            <CardDescription>Visualiza tus rutas de entrega</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">El mapa de entregas estará disponible pronto</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
