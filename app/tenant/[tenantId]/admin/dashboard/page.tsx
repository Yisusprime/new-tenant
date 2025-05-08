"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useBranch } from "@/lib/context/branch-context"

export default function AdminDashboardPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [stats, setStats] = useState({
    branches: 0,
    customers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Contar sucursales
        const branchesQuery = query(collection(db, `tenants/${tenantId}/branches`), limit(100))
        const branchesSnapshot = await getDocs(branchesQuery)
        const branchesCount = branchesSnapshot.size

        // Contar clientes
        const customersQuery = query(collection(db, `tenants/${tenantId}/users`), limit(100))
        const customersSnapshot = await getDocs(customersQuery)
        const customersCount = customersSnapshot.size

        setStats({
          branches: branchesCount,
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sucursales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.branches}</div>
            <p className="text-xs text-muted-foreground">
              {currentBranch ? `Sucursal actual: ${currentBranch.name}` : "Ninguna sucursal seleccionada"}
            </p>
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
          <TabsTrigger value="branches">Sucursales</TabsTrigger>
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
                  <Link href="/admin/branches">Gestionar Sucursales</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/settings">Configuración</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/" target="_blank" rel="noreferrer">
                    Ver Sitio Web
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>Sucursales</CardTitle>
              <CardDescription>Gestiona las sucursales de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button asChild>
                  <Link href="/admin/branches">Gestionar Sucursales</Link>
                </Button>
              </div>
              {stats.branches === 0 ? (
                <p className="text-center py-8 text-gray-500">No hay sucursales configuradas</p>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  Tienes {stats.branches} sucursal{stats.branches !== 1 ? "es" : ""} configurada
                  {stats.branches !== 1 ? "s" : ""}
                </p>
              )}
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
