"use client"

import { useState, useEffect } from "react"
import { useIngredients } from "./ingredient-context"
import { type Ingredient, INGREDIENT_CATEGORIES } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Edit, Plus, Search, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IngredientForm } from "./ingredient-form"

export function IngredientList() {
  const { ingredients, loading, error, deleteIngredient, getLowStockIngredients } = useIngredients()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showLowStock, setShowLowStock] = useState(false)
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)

  // Filtrar ingredientes
  useEffect(() => {
    let filtered = [...ingredients]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter((ingredient) => ingredient.category === categoryFilter)
    }

    // Filtrar por stock bajo
    if (showLowStock) {
      filtered = filtered.filter((ingredient) => ingredient.stock <= ingredient.minStock)
    }

    setFilteredIngredients(filtered)
  }, [ingredients, searchTerm, categoryFilter, showLowStock])

  const handleDeleteClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setIsFormDialogOpen(true)
  }

  const handleAddClick = () => {
    setSelectedIngredient(null)
    setIsFormDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedIngredient) {
      await deleteIngredient(selectedIngredient.id)
      setIsDeleteDialogOpen(false)
    }
  }

  const lowStockCount = getLowStockIngredients().length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ingredientes</h2>
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
        <h2 className="text-2xl font-bold">Ingredientes</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Ingrediente
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ingredientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {INGREDIENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showLowStock ? "default" : "outline"}
          onClick={() => setShowLowStock(!showLowStock)}
          className="w-full md:w-auto"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Stock Bajo ({lowStockCount})
        </Button>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {filteredIngredients.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron ingredientes con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ingredient) => (
            <Card key={ingredient.id} className={ingredient.stock <= ingredient.minStock ? "border-destructive" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{ingredient.name}</CardTitle>
                    <CardDescription>{ingredient.category}</CardDescription>
                  </div>
                  <Badge variant={ingredient.stock <= ingredient.minStock ? "destructive" : "outline"}>
                    {ingredient.stock} {ingredient.unit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{ingredient.description || "Sin descripción"}</p>
                  <div className="flex justify-between text-sm">
                    <span>
                      Costo: ${ingredient.cost.toFixed(2)}/{ingredient.unit}
                    </span>
                    <span>
                      Mínimo: {ingredient.minStock} {ingredient.unit}
                    </span>
                  </div>
                  {ingredient.location && (
                    <p className="text-xs text-muted-foreground">Ubicación: {ingredient.location}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(ingredient)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(ingredient)}>
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
              ¿Estás seguro de que deseas eliminar el ingrediente "{selectedIngredient?.name}"? Esta acción no se puede
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedIngredient ? "Editar Ingrediente" : "Añadir Ingrediente"}</DialogTitle>
          </DialogHeader>
          <IngredientForm ingredient={selectedIngredient} onSuccess={() => setIsFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
