"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IngredientProvider } from "@/components/inventory/ingredient-context"
import { SupplierProvider } from "@/components/inventory/supplier-context"
import { PurchaseProvider } from "@/components/inventory/purchase-context"
import { RecipeProvider } from "@/components/inventory/recipe-context"
import { InventoryMovementProvider } from "@/components/inventory/inventory-movement-context"
import { IngredientList } from "@/components/inventory/ingredient-list"
import { SupplierList } from "@/components/inventory/supplier-list"
import { PurchaseList } from "@/components/inventory/purchase-list"
import { RecipeList } from "@/components/inventory/recipe-list"
import { InventoryMovementList } from "@/components/inventory/inventory-movement-list"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-config"

export default function InventoryPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTenantId() {
      if (!user) return

      try {
        // Obtener el tenantId del usuario actual
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists() && userSnap.data().tenantId) {
          setTenantId(userSnap.data().tenantId)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error al obtener el tenantId:", error)
        setLoading(false)
      }
    }

    fetchTenantId()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No se pudo cargar la información del restaurante</h2>
        <p className="text-muted-foreground">Por favor, intenta recargar la página o contacta a soporte.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>

      <IngredientProvider tenantId={tenantId}>
        <SupplierProvider tenantId={tenantId}>
          <PurchaseProvider tenantId={tenantId}>
            <RecipeProvider tenantId={tenantId}>
              <InventoryMovementProvider tenantId={tenantId}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
                    <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
                    <TabsTrigger value="purchases">Compras</TabsTrigger>
                    <TabsTrigger value="recipes">Recetas</TabsTrigger>
                    <TabsTrigger value="movements">Movimientos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-4">
                    <InventoryDashboard />
                  </TabsContent>

                  <TabsContent value="ingredients" className="space-y-4">
                    <IngredientList />
                  </TabsContent>

                  <TabsContent value="suppliers" className="space-y-4">
                    <SupplierList />
                  </TabsContent>

                  <TabsContent value="purchases" className="space-y-4">
                    <PurchaseList />
                  </TabsContent>

                  <TabsContent value="recipes" className="space-y-4">
                    <RecipeList />
                  </TabsContent>

                  <TabsContent value="movements" className="space-y-4">
                    <InventoryMovementList />
                  </TabsContent>
                </Tabs>
              </InventoryMovementProvider>
            </RecipeProvider>
          </PurchaseProvider>
        </SupplierProvider>
      </IngredientProvider>
    </div>
  )
}
