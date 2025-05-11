"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { SampleDataImporter } from "./components/sample-data-importer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getProducts } from "@/lib/services/product-service"
import { getCategories } from "@/lib/services/category-service"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, LayoutGrid, Users, DollarSign } from "lucide-react"

export default function DashboardPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
  })
  const [categoryData, setCategoryData] = useState<{ name: string; products: number }[]>([])

  useEffect(() => {
    async function loadData() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Cargar productos y categorías
        const products = await getProducts(tenantId, currentBranch.id)
        const categories = await getCategories(tenantId, currentBranch.id)

        // Calcular estadísticas
        const featuredProducts = products.filter((p) => p.isFeatured).length

        // Preparar datos para el gráfico
        const catData = categories.map((category) => {
          const productsInCategory = products.filter((p) => p.categoryId === category.id).length
          return {
            name: category.name,
            products: productsInCategory,
          }
        })

        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          featuredProducts,
        })

        setCategoryData(catData)
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenantId, currentBranch])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="tools">Herramientas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Productos"
                value={stats.totalProducts}
                description="Total de productos"
                icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
                loading={loading}
              />
              <StatsCard
                title="Categorías"
                value={stats.totalCategories}
                description="Total de categorías"
                icon={<LayoutGrid className="h-5 w-5 text-green-600" />}
                loading={loading}
              />
              <StatsCard
                title="Destacados"
                value={stats.featuredProducts}
                description="Productos destacados"
                icon={<DollarSign className="h-5 w-5 text-yellow-600" />}
                loading={loading}
              />
              <StatsCard
                title="Clientes"
                value={0}
                description="Próximamente"
                icon={<Users className="h-5 w-5 text-purple-600" />}
                loading={loading}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Productos por Categoría</CardTitle>
                <CardDescription>Distribución de productos en cada categoría</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="products" fill="#3b82f6" name="Productos" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                    No hay datos disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <SampleDataImporter tenantId={tenantId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
