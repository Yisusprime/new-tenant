"use client"

import { useState } from "react"
import { useRecipes } from "./recipe-context"
import type { Recipe } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RecipeForm } from "./recipe-form"
import { RecipeDetails } from "./recipe-details"

export function RecipeList() {
  const { recipes, loading, error, deleteRecipe } = useRecipes()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filtrar recetas por término de búsqueda
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsFormDialogOpen(true)
  }

  const handleDetailsClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDetailsDialogOpen(true)
  }

  const handleAddClick = () => {
    setSelectedRecipe(null)
    setIsFormDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedRecipe) {
      await deleteRecipe(selectedRecipe.id)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recetas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Recetas</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Receta
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar recetas..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron recetas con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{recipe.productName}</CardTitle>
                    <CardDescription>{recipe.ingredients.length} ingredientes</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {recipe.yield} {recipe.yield === 1 ? "porción" : "porciones"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recipe.preparationTime && (
                    <div className="text-sm">
                      <span className="font-medium">Tiempo de preparación:</span> {recipe.preparationTime} minutos
                    </div>
                  )}
                  <div className="text-sm line-clamp-2">
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <span key={ing.ingredientId}>
                        {i > 0 && ", "}
                        {ing.ingredientName}
                      </span>
                    ))}
                    {recipe.ingredients.length > 3 && ", ..."}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleDetailsClick(recipe)}>
                  <Eye className="mr-2 h-4 w-4" /> Ver
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditClick(recipe)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(recipe)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la receta "{selectedRecipe?.productName}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de formulario */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedRecipe ? "Editar Receta" : "Añadir Receta"}</DialogTitle>
          </DialogHeader>
          <RecipeForm recipe={selectedRecipe} onSuccess={() => setIsFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalles */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Receta</DialogTitle>
          </DialogHeader>
          {selectedRecipe && <RecipeDetails recipe={selectedRecipe} onClose={() => setIsDetailsDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
