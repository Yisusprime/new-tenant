"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTenant } from "@/lib/tenant-utils"
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

export default function InventoryPage() {
  const { user } = useAuth()
  const { tenant } = useTenant()
  const [activeTab, setActiveTab] = useState("dashboard")

  if (!user || !tenant) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>

      <IngredientProvider tenantId={tenant.id}>
        <SupplierProvider tenantId={tenant.id}>
          <PurchaseProvider tenantId={tenant.id}>
            <RecipeProvider tenantId={tenant.id}>
              <InventoryMovementProvider tenantId={tenant.id}>
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
