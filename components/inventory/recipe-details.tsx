"use client"

import type { Recipe } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface RecipeDetailsProps {
  recipe: Recipe
  onClose: () => void
}

export function RecipeDetails({ recipe, onClose }: RecipeDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Producto</h3>
          <p className="text-lg font-semibold">{recipe.productName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Rendimiento</h3>
          <p className="text-lg font-semibold">
            {recipe.yield} {recipe.yield === 1 ? "porción" : "porciones"}
          </p>
        </div>
      </div>

      {recipe.preparationTime && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Tiempo de preparación</h3>
          <p>{recipe.preparationTime} minutos</p>
        </div>
      )}

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Ingredientes</h3>
        <div className="space-y-3">
          {recipe.ingredients.map((ingredient, index) => (
            <Card key={index}>
              <CardHeader className="py-3">
                <CardTitle className="text-base">{ingredient.ingredientName}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="text-sm">
                  <p className="font-medium">
                    {ingredient.quantity} {ingredient.unit}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {recipe.instructions && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-medium mb-2">Instrucciones</h3>
            <div className="whitespace-pre-line text-sm">{recipe.instructions}</div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  )
}
