"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useIngredients } from "./ingredient-context"
import { usePurchases } from "./purchase-context"
import { useInventoryMovements } from "./inventory-movement-context"
import { AlertCircle, TrendingUp, Package } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function InventoryDashboard() {
  const { ingredients, getLowStockIngredients } = useIngredients()
  const { purchases } = usePurchases()
  const { movements } = useInventoryMovements()
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [topConsumed, setTopConsumed] = useState<any[]>([])
  const [recentPurchases, setRecentPurchases] = useState<any[]>([])
  const [inventoryValue, setInventoryValue] = useState(0)

  useEffect(() => {
    // Calcular ingredientes con stock bajo
    const lowStock = getLowStockIngredients().slice(0, 5)
    setLowStockItems(lowStock)

    // Calcular valor total del inventario
    const totalValue = ingredients.reduce((sum, ing) => sum + ing.stock * ing.cost, 0)
    setInventoryValue(totalValue)

    // Obtener compras recientes
    const recent = [...purchases].sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime()).slice(0, 3)
    setRecentPurchases(recent)

    // Calcular ingredientes más consumidos
    const consumptionByIngredient = movements
      .filter((m) => m.type === "consumption")
      .reduce(
        (acc, m) => {
          acc[m.ingredientId] = (acc[m.ingredientId] || 0) + Math.abs(m.quantity)
          return acc
        },
        {} as Record<string, number>,
      )

    const topItems = Object.entries(consumptionByIngredient)
      .map(([id, qty]) => {
        const ingredient = ingredients.find((i) => i.id === id)
        return {
          id,
          name: ingredient?.name || "Desconocido",
          quantity: qty,
          unit: ingredient?.unit || "",
        }
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    setTopConsumed(topItems)
  }, [ingredients, purchases, movements, getLowStockIngredients])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Valor del inventario */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${inventoryValue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Total de {ingredients.length} ingredientes en stock</p>
        </CardContent>
      </Card>

      {/* Alertas de stock bajo */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Alertas de Stock Bajo</CardTitle>
          <CardDescription>Ingredientes que necesitan reabastecimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay ingredientes con stock bajo</p>
          ) : (
            lowStockItems.map((item) => (
              <Alert key={item.id} variant="destructive" className="bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{item.name}</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>
                    Stock: {item.stock} {item.unit} (Mínimo: {item.minStock} {item.unit})
                  </span>
                  <Progress value={(item.stock / item.minStock) * 100} className="w-24 h-2" />
                </AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Se muestran hasta 5 ingredientes con stock por debajo del mínimo
          </p>
        </CardFooter>
      </Card>

      {/* Ingredientes más consumidos */}
      <Card>
        <CardHeader>
          <CardTitle>Más Consumidos</CardTitle>
          <CardDescription>Ingredientes con mayor consumo</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {topConsumed.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay datos de consumo</p>
            ) : (
              topConsumed.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">
                    {item.quantity} {item.unit}
                    <TrendingUp className="h-4 w-4 text-green-500 inline ml-1" />
                  </span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Compras recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Compras Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay compras recientes</p>
          ) : (
            <ul className="space-y-2">
              {recentPurchases.map((purchase) => (
                <li key={purchase.id} className="text-sm">
                  <div className="font-medium">{purchase.supplierName}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(purchase.orderDate, "dd MMM yyyy", { locale: es })} - ${purchase.totalAmount.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
