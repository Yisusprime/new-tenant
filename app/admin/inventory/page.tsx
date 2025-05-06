"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard"
import { IngredientList } from "@/components/inventory/ingredient-list"
import { SupplierList } from "@/components/inventory/supplier-list"
import { PurchaseList } from "@/components/inventory/purchase-list"
import { RecipeList } from "@/components/inventory/recipe-list"
import { InventoryMovementList } from "@/components/inventory/inventory-movement-list"
import { IngredientProvider } from "@/components/inventory/ingredient-context"
import { SupplierProvider } from "@/components/inventory/supplier-context"
import { PurchaseProvider } from "@/components/inventory/purchase-context"
import { RecipeProvider } from "@/components/inventory/recipe-context"
import { InventoryMovementProvider } from "@/components/inventory/inventory-movement-context"

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <IngredientProvider>
      <SupplierProvider>
        <PurchaseProvider>
          <RecipeProvider>
            <InventoryMovementProvider>
              <div className="w-full">
                <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-6 mb-8">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
                    <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
                    <TabsTrigger value="purchases">Compras</TabsTrigger>
                    <TabsTrigger value="recipes">Recetas</TabsTrigger>
                    <TabsTrigger value="movements">Movimientos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard">
                    <Card>
                      <CardHeader>
                        <CardTitle>Dashboard de Inventario</CardTitle>
                        <CardDescription>Resumen y estadísticas de tu inventario</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <InventoryDashboard />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ingredients">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ingredientes</CardTitle>
                        <CardDescription>Gestiona los ingredientes de tu inventario</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IngredientList />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="suppliers">
                    <Card>
                      <CardHeader>
                        <CardTitle>Proveedores</CardTitle>
                        <CardDescription>Gestiona los proveedores de tu restaurante</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SupplierList />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="purchases">
                    <Card>
                      <CardHeader>
                        <CardTitle>Compras</CardTitle>
                        <CardDescription>Gestiona las órdenes de compra y recepciones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PurchaseList />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recipes">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recetas</CardTitle>
                        <CardDescription>Gestiona las recetas y su relación con los ingredientes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RecipeList />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="movements">
                    <Card>
                      <CardHeader>
                        <CardTitle>Movimientos de Inventario</CardTitle>
                        <CardDescription>Registra consumos, desperdicios y ajustes de stock</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <InventoryMovementList />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </InventoryMovementProvider>
          </RecipeProvider>
        </PurchaseProvider>
      </SupplierProvider>
    </IngredientProvider>
  )
}
