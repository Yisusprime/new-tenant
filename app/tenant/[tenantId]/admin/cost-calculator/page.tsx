"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Save, Calculator, FileText, ChefHat, Percent, DollarSign, Search, Package } from "lucide-react"
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import { QuickCalculatorModal } from "@/components/quick-calculator-modal"
import { getInventoryItems } from "@/lib/services/inventory-service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { InventoryItem } from "@/lib/types/inventory"

// Tipos para la calculadora
interface Ingredient {
  id: string
  name: string
  cost: number
  unit: string
  quantity: number
  inventoryItemId?: string // ID del item de inventario relacionado
}

interface Recipe {
  id?: string
  name: string
  description: string
  ingredients: Ingredient[]
  laborCost: number
  overheadPercentage: number
  profitMarginPercentage: number
  servings: number
  totalCost?: number
  costPerServing?: number
  suggestedPrice?: number
}

// Unidades de medida comunes
const units = [
  { value: "g", label: "Gramos" },
  { value: "kg", label: "Kilogramos" },
  { value: "ml", label: "Mililitros" },
  { value: "l", label: "Litros" },
  { value: "unidad", label: "Unidad" },
  { value: "cucharada", label: "Cucharada" },
  { value: "cucharadita", label: "Cucharadita" },
  { value: "taza", label: "Taza" },
  { value: "oz", label: "Onza" },
  { value: "lb", label: "Libra" },
]

export default function CostCalculatorPage() {
  const params = useParams<{ tenantId: string }>()
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("calculator")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false)

  // Estado para la receta actual
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({
    name: "",
    description: "",
    ingredients: [],
    laborCost: 0,
    overheadPercentage: 15, // Valor predeterminado
    profitMarginPercentage: 30, // Valor predeterminado
    servings: 1,
  })

  // Estado para un nuevo ingrediente
  const [newIngredient, setNewIngredient] = useState<Omit<Ingredient, "id">>({
    name: "",
    cost: 0,
    unit: "g",
    quantity: 0,
  })

  // Obtener la configuración del restaurante para el formato de moneda
  const { data: restaurantConfig } = useRestaurantConfig(params.tenantId, "basicInfo", {
    currencyCode: "CLP",
  })

  // Obtener el código de moneda configurado
  const currencyCode = restaurantConfig?.currencyCode || "CLP"

  // Cargar recetas guardadas
  useEffect(() => {
    if (currentBranch?.id) {
      loadRecipes()
      loadInventoryItems()
    }
  }, [currentBranch])

  // Filtrar items de inventario cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInventoryItems(inventoryItems)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query),
      )
      setFilteredInventoryItems(filtered)
    }
  }, [searchQuery, inventoryItems])

  // Función para cargar recetas
  const loadRecipes = async () => {
    if (!currentBranch?.id) return

    setLoading(true)
    try {
      const recipesCollection = collection(db, `tenants/${params.tenantId}/branches/${currentBranch.id}/costRecipes`)
      const recipesSnapshot = await getDocs(recipesCollection)
      const recipesList = recipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Recipe[]
      setRecipes(recipesList)
    } catch (error) {
      console.error("Error al cargar recetas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recetas guardadas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar items del inventario
  const loadInventoryItems = async () => {
    if (!currentBranch?.id) return

    try {
      const items = await getInventoryItems(params.tenantId, currentBranch.id)
      setInventoryItems(items)
      setFilteredInventoryItems(items)
    } catch (error) {
      console.error("Error al cargar inventario:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    }
  }

  // Función para agregar un ingrediente
  const addIngredient = () => {
    if (!newIngredient.name || newIngredient.cost <= 0 || newIngredient.quantity <= 0) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos del ingrediente",
        variant: "destructive",
      })
      return
    }

    const ingredient: Ingredient = {
      ...newIngredient,
      id: Date.now().toString(),
    }

    setCurrentRecipe({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, ingredient],
    })

    // Resetear el formulario de nuevo ingrediente
    setNewIngredient({
      name: "",
      cost: 0,
      unit: "g",
      quantity: 0,
    })
  }

  // Función para agregar un ingrediente desde el inventario
  const addIngredientFromInventory = (item: InventoryItem) => {
    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: item.name,
      cost: item.costPerUnit,
      unit: item.unit,
      quantity: 1, // Cantidad predeterminada
      inventoryItemId: item.id,
    }

    setCurrentRecipe({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, ingredient],
    })

    setInventoryDialogOpen(false)
    toast({
      title: "Ingrediente agregado",
      description: `${item.name} ha sido agregado a la receta`,
    })
  }

  // Función para eliminar un ingrediente
  const removeIngredient = (id: string) => {
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: currentRecipe.ingredients.filter((ing) => ing.id !== id),
    })
  }

  // Función para calcular costos
  const calculateCosts = () => {
    // Costo total de ingredientes
    const ingredientsCost = currentRecipe.ingredients.reduce(
      (sum, ingredient) => sum + ingredient.cost * ingredient.quantity,
      0,
    )

    // Costo total (ingredientes + mano de obra)
    const subtotal = ingredientsCost + currentRecipe.laborCost

    // Costos indirectos
    const overhead = subtotal * (currentRecipe.overheadPercentage / 100)

    // Costo total de producción
    const totalCost = subtotal + overhead

    // Costo por porción
    const costPerServing = totalCost / currentRecipe.servings

    // Precio sugerido (incluyendo margen de ganancia)
    const suggestedPrice = costPerServing * (1 + currentRecipe.profitMarginPercentage / 100)

    return {
      ingredientsCost,
      subtotal,
      overhead,
      totalCost,
      costPerServing,
      suggestedPrice,
    }
  }

  // Guardar receta
  const saveRecipe = async () => {
    if (!currentBranch?.id) {
      toast({
        title: "Error",
        description: "Debe seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    if (!currentRecipe.name) {
      toast({
        title: "Error",
        description: "La receta debe tener un nombre",
        variant: "destructive",
      })
      return
    }

    if (currentRecipe.ingredients.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un ingrediente",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const costs = calculateCosts()
      const recipeToSave = {
        ...currentRecipe,
        totalCost: costs.totalCost,
        costPerServing: costs.costPerServing,
        suggestedPrice: costs.suggestedPrice,
        updatedAt: new Date().toISOString(),
      }

      if (currentRecipe.id) {
        // Actualizar receta existente
        const recipeRef = doc(
          db,
          `tenants/${params.tenantId}/branches/${currentBranch.id}/costRecipes`,
          currentRecipe.id,
        )
        await updateDoc(recipeRef, recipeToSave)
        toast({
          title: "Éxito",
          description: "Receta actualizada correctamente",
        })
      } else {
        // Crear nueva receta
        const recipesCollection = collection(db, `tenants/${params.tenantId}/branches/${currentBranch.id}/costRecipes`)
        await addDoc(recipesCollection, {
          ...recipeToSave,
          createdAt: new Date().toISOString(),
        })
        toast({
          title: "Éxito",
          description: "Receta guardada correctamente",
        })
      }

      // Recargar recetas y limpiar formulario
      await loadRecipes()
      setCurrentRecipe({
        name: "",
        description: "",
        ingredients: [],
        laborCost: 0,
        overheadPercentage: 15,
        profitMarginPercentage: 30,
        servings: 1,
      })
      setActiveTab("saved")
    } catch (error) {
      console.error("Error al guardar receta:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la receta",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Cargar receta para editar
  const loadRecipeForEdit = async (recipeId: string) => {
    if (!currentBranch?.id) return

    try {
      const recipeRef = doc(db, `tenants/${params.tenantId}/branches/${currentBranch.id}/costRecipes`, recipeId)
      const recipeSnap = await getDoc(recipeRef)

      if (recipeSnap.exists()) {
        setCurrentRecipe(recipeSnap.data() as Recipe)
        setActiveTab("calculator")
      }
    } catch (error) {
      console.error("Error al cargar receta:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la receta para editar",
        variant: "destructive",
      })
    }
  }

  // Eliminar receta
  const deleteRecipe = async (recipeId: string) => {
    if (!currentBranch?.id) return

    if (!confirm("¿Está seguro de eliminar esta receta? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const recipeRef = doc(db, `tenants/${params.tenantId}/branches/${currentBranch.id}/costRecipes`, recipeId)
      await deleteDoc(recipeRef)
      toast({
        title: "Éxito",
        description: "Receta eliminada correctamente",
      })
      await loadRecipes()
    } catch (error) {
      console.error("Error al eliminar receta:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la receta",
        variant: "destructive",
      })
    }
  }

  // Nueva receta
  const newRecipe = () => {
    setCurrentRecipe({
      name: "",
      description: "",
      ingredients: [],
      laborCost: 0,
      overheadPercentage: 15,
      profitMarginPercentage: 30,
      servings: 1,
    })
    setActiveTab("calculator")
  }

  // Abrir diálogo de inventario
  const openInventoryDialog = () => {
    setSearchQuery("")
    setFilteredInventoryItems(inventoryItems)
    setInventoryDialogOpen(true)
  }

  // Calcular resultados para mostrar
  const results = calculateCosts()

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calculadora de Costos de Producción</h1>
          <p className="text-muted-foreground">
            Calcule con precisión los costos de sus recetas y establezca precios rentables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickCalculatorModal />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>Calculadora</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Recetas Guardadas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información básica de la receta */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Información de la Receta
                </CardTitle>
                <CardDescription>Ingrese los detalles básicos de su receta o preparación</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="recipe-name">Nombre de la Receta</Label>
                      <Input
                        id="recipe-name"
                        placeholder="Ej: Hamburguesa Clásica"
                        value={currentRecipe.name}
                        onChange={(e) => setCurrentRecipe({ ...currentRecipe, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">Porciones/Unidades</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        placeholder="Número de porciones"
                        value={currentRecipe.servings}
                        onChange={(e) =>
                          setCurrentRecipe({ ...currentRecipe, servings: Number.parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Input
                      id="description"
                      placeholder="Breve descripción de la receta"
                      value={currentRecipe.description}
                      onChange={(e) => setCurrentRecipe({ ...currentRecipe, description: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredientes */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ingredientes</CardTitle>
                  <Button variant="outline" size="sm" onClick={openInventoryDialog} className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>Agregar desde Inventario</span>
                  </Button>
                </div>
                <CardDescription>Agregue todos los ingredientes y sus costos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Formulario para agregar ingredientes */}
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="ingredient-name">Ingrediente</Label>
                      <Input
                        id="ingredient-name"
                        placeholder="Nombre del ingrediente"
                        value={newIngredient.name}
                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ingredient-quantity">Cantidad</Label>
                      <Input
                        id="ingredient-quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Cantidad"
                        value={newIngredient.quantity || ""}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            quantity: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="ingredient-unit">Unidad</Label>
                      <Select
                        value={newIngredient.unit}
                        onValueChange={(value) => setNewIngredient({ ...newIngredient, unit: value })}
                      >
                        <SelectTrigger id="ingredient-unit">
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ingredient-cost">Costo</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="ingredient-cost"
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-8"
                          placeholder="0.00"
                          value={newIngredient.cost || ""}
                          onChange={(e) =>
                            setNewIngredient({
                              ...newIngredient,
                              cost: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={addIngredient} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Ingrediente
                    </Button>
                  </div>

                  <Separator />

                  {/* Lista de ingredientes */}
                  {currentRecipe.ingredients.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Costo Unitario</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRecipe.ingredients.map((ingredient) => (
                          <TableRow key={ingredient.id}>
                            <TableCell>
                              {ingredient.name}
                              {ingredient.inventoryItemId && (
                                <Badge variant="outline" className="ml-2">
                                  Inventario
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {ingredient.quantity} {ingredient.unit}
                            </TableCell>
                            <TableCell>{formatCurrency(ingredient.cost, currencyCode)}</TableCell>
                            <TableCell>{formatCurrency(ingredient.cost * ingredient.quantity, currencyCode)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => removeIngredient(ingredient.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No hay ingredientes agregados</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Costos adicionales y resultados */}
            <Card>
              <CardHeader>
                <CardTitle>Costos Adicionales</CardTitle>
                <CardDescription>Agregue mano de obra y otros costos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="labor-cost">Costo de Mano de Obra</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="labor-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        value={currentRecipe.laborCost || ""}
                        onChange={(e) =>
                          setCurrentRecipe({
                            ...currentRecipe,
                            laborCost: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="overhead-percentage">Costos Indirectos (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="overhead-percentage"
                        type="number"
                        min="0"
                        max="100"
                        className="pl-8"
                        placeholder="15"
                        value={currentRecipe.overheadPercentage || ""}
                        onChange={(e) =>
                          setCurrentRecipe({
                            ...currentRecipe,
                            overheadPercentage: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Incluye electricidad, agua, gas, alquiler, etc.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="profit-margin">Margen de Ganancia (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="profit-margin"
                        type="number"
                        min="0"
                        className="pl-8"
                        placeholder="30"
                        value={currentRecipe.profitMarginPercentage || ""}
                        onChange={(e) =>
                          setCurrentRecipe({
                            ...currentRecipe,
                            profitMarginPercentage: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span>Costo de Ingredientes:</span>
                      <span className="font-medium">{formatCurrency(results.ingredientsCost, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de Mano de Obra:</span>
                      <span className="font-medium">{formatCurrency(currentRecipe.laborCost, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(results.subtotal, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costos Indirectos ({currentRecipe.overheadPercentage}%):</span>
                      <span className="font-medium">{formatCurrency(results.overhead, currencyCode)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Costo Total de la Receta:</span>
                      <span>{formatCurrency(results.totalCost, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Costo por Porción ({currentRecipe.servings} porciones):</span>
                      <span>{formatCurrency(results.costPerServing, currencyCode)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Precio Sugerido por Porción:</span>
                      <span className="text-green-600">{formatCurrency(results.suggestedPrice, currencyCode)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Precio Total de Venta (todas las porciones):</span>
                      <span className="text-green-600">
                        {formatCurrency(results.suggestedPrice * currentRecipe.servings, currencyCode)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Incluye {currentRecipe.profitMarginPercentage}% de margen de ganancia sobre el costo por porción
                    </p>
                  </div>

                  <Button className="w-full mt-4 flex items-center gap-2" onClick={saveRecipe} disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Guardando..." : "Guardar Receta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recetas Guardadas</CardTitle>
                <Button onClick={newRecipe} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Receta
                </Button>
              </div>
              <CardDescription>Gestione sus recetas y fórmulas guardadas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando recetas...</div>
              ) : recipes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Porciones</TableHead>
                      <TableHead>Costo Total</TableHead>
                      <TableHead>Costo por Porción</TableHead>
                      <TableHead>Precio por Porción</TableHead>
                      <TableHead>Precio Total</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>{recipe.servings}</TableCell>
                        <TableCell>{formatCurrency(recipe.totalCost || 0, currencyCode)}</TableCell>
                        <TableCell>{formatCurrency(recipe.costPerServing || 0, currencyCode)}</TableCell>
                        <TableCell>{formatCurrency(recipe.suggestedPrice || 0, currencyCode)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency((recipe.suggestedPrice || 0) * recipe.servings, currencyCode)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => loadRecipeForEdit(recipe.id!)}>
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => deleteRecipe(recipe.id!)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay recetas guardadas. Cree una nueva receta para comenzar.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para seleccionar items del inventario */}
      <Dialog open={inventoryDialogOpen} onOpenChange={setInventoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Ingrediente del Inventario</DialogTitle>
            <DialogDescription>Seleccione un item del inventario para agregarlo como ingrediente</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar items..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredInventoryItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Costo Unitario</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(item.costPerUnit, currencyCode)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => addIngredientFromInventory(item)}>
                          Agregar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery
                  ? "No se encontraron items que coincidan con la búsqueda"
                  : "No hay items en el inventario"}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setInventoryDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
