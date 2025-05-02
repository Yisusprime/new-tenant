"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Utensils, ShoppingBag, BarChart3, Calendar } from "lucide-react"
import Link from "next/link"
import LoadingScreen from "@/components/loading-screen"

export default function ManagerDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [orderCount, setOrderCount] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(0)
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "manager")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  // Aquí podrías cargar datos específicos para el dashboard de gerente
  useEffect(() => {
    // Simulación de carga de datos
    setOrderCount(124)
    setEmployeeCount(8)
    setRevenue(4850)
  }, [])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard de Gerente</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bienvenido, {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-muted-foreground">+18 hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Empleados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeeCount}</div>
              <p className="text-xs text-muted-foreground">+1 esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ingresos (€)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+€750 esta semana</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona tu restaurante</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link href="/manager/orders">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Gestionar Pedidos
                </Button>
              </Link>
              <Link href="/manager/menu">
                <Button variant="outline" className="w-full justify-start">
                  <Utensils className="mr-2 h-4 w-4" />
                  Gestionar Menú
                </Button>
              </Link>
              <Link href="/manager/employees">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Empleados
                </Button>
              </Link>
              <Link href="/manager/schedule">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Horarios
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Últimos pedidos recibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm">Pedido #1234 - Mesa 5</p>
                    <p className="text-xs text-muted-foreground">Hace 10 minutos</p>
                  </div>
                  <div className="text-sm font-medium">€24.50</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm">Pedido #1233 - Delivery</p>
                    <p className="text-xs text-muted-foreground">Hace 25 minutos</p>
                  </div>
                  <div className="text-sm font-medium">€32.75</div>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-orange-500"></div>
                  <div className="flex-1">
                    <p className="text-sm">Pedido #1232 - Mesa 3</p>
                    <p className="text-xs text-muted-foreground">Hace 45 minutos</p>
                  </div>
                  <div className="text-sm font-medium">€18.90</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Semanal</CardTitle>
            <CardDescription>Ventas de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Las estadísticas detalladas estarán disponibles pronto</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
