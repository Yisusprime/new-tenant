"use client"

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
import { Trash2, Plus, Save, Calculator, FileText, ChefHat, Percent, DollarSign } from "lucide-react"
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { toast } from "@/components/ui/use-toast"

// Tipos para la calculadora
interface Ingredient {
  id: string
  name: string
  cost: number
  unit: string
  quantity: number
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

  // Cargar recetas guardadas
  useEffect(() => {
    if (currentBranch?.id) {
      loadRecipes()
    }
  }, [currentBranch])

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
                <CardTitle>Ingredientes</CardTitle>
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
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>
                              {ingredient.quantity} {ingredient.unit}
                            </TableCell>
                            <TableCell>${ingredient.cost.toFixed(2)}</TableCell>
                            <TableCell>${(ingredient.cost * ingredient.quantity).toFixed(2)}</TableCell>
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
                      <span className="font-medium">${results.ingredientsCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo de Mano de Obra:</span>
                      <span className="font-medium">${currentRecipe.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${results.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costos Indirectos ({currentRecipe.overheadPercentage}%):</span>
                      <span className="font-medium">${results.overhead.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Costo Total:</span>
                      <span>${results.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Costo por Porción:</span>
                      <span>${results.costPerServing.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Precio Sugerido:</span>
                      <span className="text-green-600">${results.suggestedPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Incluye {currentRecipe.profitMarginPercentage}% de margen de ganancia
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
                      <TableHead>Precio Sugerido</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>{recipe.servings}</TableCell>
                        <TableCell>${recipe.totalCost?.toFixed(2)}</TableCell>
                        <TableCell>${recipe.costPerServing?.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">${recipe.suggestedPrice?.toFixed(2)}</TableCell>
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
    </div>
  )
}
