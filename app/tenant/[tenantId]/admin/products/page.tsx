"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ProductsList } from "./components/products-list"
import { ProductExtrasList } from "./components/product-extras-list"
import { PlusCircle } from "lucide-react"

export default function ProductsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { currentBranch } = useBranch()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")

  // Redirigir a la página de creación de producto
  const handleCreateProduct = () => {
    if (!currentBranch) return
    router.push(`/admin/products/create`)
  }

  // Redirigir a la página de creación de extra
  const handleCreateExtra = () => {
    if (!currentBranch) return
    router.push(`/admin/products/extras/create`)
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
      </div>

      {!currentBranch ? (
        <NoBranchSelectedAlert />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="extras">Extras Globales</TabsTrigger>
            </TabsList>

            {activeTab === "products" ? (
              <Button onClick={handleCreateProduct}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            ) : (
              <Button onClick={handleCreateExtra}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Extra
              </Button>
            )}
          </div>

          <TabsContent value="products" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
                <CardDescription>Gestiona los productos de la sucursal: {currentBranch.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductsList tenantId={params.tenantId} branchId={currentBranch.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extras" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Extras Globales</CardTitle>
                <CardDescription>Gestiona los extras que se pueden agregar a los productos</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductExtrasList tenantId={params.tenantId} branchId={currentBranch.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
