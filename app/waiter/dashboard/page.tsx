"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Utensils, Clock, CheckCircle, AlertCircle } from "lucide-react"
import LoadingScreen from "@/components/loading-screen"

export default function WaiterDashboard() {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()
  const [assignedTables, setAssignedTables] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "waiter")) {
      router.push("/login")
    }
  }, [user, userProfile, loading, router])

  // Aquí podrías cargar datos específicos para el dashboard de mesero
  useEffect(() => {
    // Simulación de carga de datos
    setAssignedTables([
      { id: 1, number: 3, status: "occupied", guests: 4 },
      { id: 2, number: 5, status: "occupied", guests: 2 },
      { id: 3, number: 8, status: "free", guests: 0 },
    ])

    setPendingOrders([
      { id: 1234, table: 3, items: 4, status: "ready", time: "10:15" },
      { id: 1235, table: 5, items: 2, status: "preparing", time: "10:20" },
    ])
  }, [])

  if (loading || !user || !userProfile) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard de Mesero</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bienvenido, {userProfile.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Mesas Asignadas</CardTitle>
              <CardDescription>Mesas que estás atendiendo actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedTables.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tienes mesas asignadas actualmente</p>
                  <Button className="mt-4">Tomar Mesa</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedTables.map((table) => (
                    <div key={table.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Mesa {table.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {table.status === "occupied" ? `${table.guests} comensales` : "Libre"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {table.status === "occupied" ? (
                          <>
                            <Button size="sm" variant="outline">
                              Ver Pedido
                            </Button>
                            <Button size="sm">Añadir Pedido</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            Asignar Comensales
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos Pendientes</CardTitle>
              <CardDescription>Pedidos que necesitan ser entregados</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay pedidos pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        {order.status === "ready" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500 mr-2" />
                        )}
                        <div>
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            Mesa {order.table} • {order.items} items • {order.time}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" disabled={order.status !== "ready"}>
                        {order.status === "ready" ? "Entregar" : "Preparando"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona tu trabajo</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <Utensils className="h-8 w-8 mb-2" />
              <span>Tomar Mesa</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <Clock className="h-8 w-8 mb-2" />
              <span>Ver Pedidos</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <AlertCircle className="h-8 w-8 mb-2" />
              <span>Solicitar Ayuda</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <CheckCircle className="h-8 w-8 mb-2" />
              <span>Finalizar Mesa</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
