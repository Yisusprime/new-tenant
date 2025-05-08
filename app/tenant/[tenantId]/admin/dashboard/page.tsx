"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    products: 0,
    customers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Contar productos
        const productsQuery = query(collection(db, `tenants/${tenantId}/products`), limit(100))
        const productsSnapshot = await getDocs(productsQuery)
        const productsCount = productsSnapshot.size

        // Contar clientes
        const customersQuery = query(collection(db, `tenants/${tenantId}/users`), limit(100))
        const customersSnapshot = await getDocs(customersQuery)
        const customersCount = customersSnapshot.size

        // Contar pedidos (si existe la colección)
        let ordersCount = 0
        let totalRevenue = 0
        try {
          const ordersQuery = query(collection(db, `tenants/${tenantId}/orders`), limit(100))
          const ordersSnapshot = await getDocs(ordersQuery)
          ordersCount = ordersSnapshot.size

          // Calcular ingresos totales
          ordersSnapshot.forEach((doc) => {
            const orderData = doc.data()
            if (orderData.total) {
              totalRevenue += orderData.total
            }
          })
        } catch (error) {
          console.log("No hay pedidos aún")
        }

        setStats({
          orders: ordersCount,
          revenue: totalRevenue,
          products: productsCount,
          customers: customersCount,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [tenantId])

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders}</div>
            <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+0% desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">+0 nuevos productos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">+0 nuevos clientes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Vista general de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Bienvenido al panel de administración. Aquí podrás gestionar todos los aspectos de tu restaurante.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Button asChild variant="outline">
                  <a href="/admin/products">Gestionar Productos</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/admin/orders">Ver Pedidos</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/admin/settings">Configuración</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/" target="_blank" rel="noreferrer">
                    Ver Sitio Web
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recientes</CardTitle>
              <CardDescription>Gestiona los pedidos de tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No hay pedidos recientes</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <CardDescription>Gestiona tu menú y productos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <a href="/admin/products/new">Añadir Producto</a>
                </Button>
              </div>
              <p className="text-center py-8 text-gray-500">No hay productos disponibles</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>Gestiona tus clientes registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">No hay clientes registrados</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
