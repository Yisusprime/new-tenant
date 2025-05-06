"use client"

import { useState } from "react"
import { useInventoryMovements } from "./inventory-movement-context"
import { useIngredients } from "./ingredient-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUp, ArrowDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InventoryMovementForm } from "./inventory-movement-form"

export function InventoryMovementList() {
  const { movements, loading, error } = useInventoryMovements()
  const { ingredients } = useIngredients()
  const [searchTerm, setSearchTerm] = useState("")
  const [ingredientFilter, setIngredientFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [movementType, setMovementType] = useState<"consumption" | "waste" | "adjustment">("consumption")

  // Filtrar movimientos
  const filteredMovements = movements.filter((movement) => {
    // Filtrar por término de búsqueda
    const matchesSearch =
      movement.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por ingrediente
    const matchesIngredient = ingredientFilter === "all" || movement.ingredientId === ingredientFilter

    // Filtrar por tipo
    const matchesType = typeFilter === "all" || movement.type === typeFilter

    return matchesSearch && matchesIngredient && matchesType
  })

  // Ordenar por fecha más reciente
  const sortedMovements = [...filteredMovements].sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleOpenForm = (type: "consumption" | "waste" | "adjustment") => {
    setMovementType(type)
    setIsFormDialogOpen(true)
  }

  // Función para obtener el color de la insignia según el tipo
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "purchase":
        return "success"
      case "consumption":
        return "destructive"
      case "waste":
        return "destructive"
      case "adjustment":
        return (type === "adjustment" && sortedMovements.find((m) => m.type === type)?.quantity) || 0 > 0
          ? "success"
          : "destructive"
      default:
        return "outline"
    }
  }

  // Función para obtener el texto del tipo en español
  const getTypeText = (type: string) => {
    switch (type) {
      case "purchase":
        return "Compra"
      case "consumption":
        return "Consumo"
      case "waste":
        return "Desperdicio"
      case "adjustment":
        return "Ajuste"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Movimientos de Inventario</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
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
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Movimientos de Inventario</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleOpenForm("consumption")}>Registrar Consumo</Button>
          <Button onClick={() => handleOpenForm("waste")}>Registrar Desperdicio</Button>
          <Button onClick={() => handleOpenForm("adjustment")}>Ajustar Inventario</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar movimientos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={ingredientFilter} onValueChange={setIngredientFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Ingrediente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los ingredientes</SelectItem>
            {ingredients.map((ingredient) => (
              <SelectItem key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="purchase">Compras</SelectItem>
            <SelectItem value="consumption">Consumos</SelectItem>
            <SelectItem value="waste">Desperdicios</SelectItem>
            <SelectItem value="adjustment">Ajustes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {sortedMovements.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron movimientos con los filtros actuales.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMovements.map((movement) => (
            <Card key={movement.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{movement.ingredientName}</CardTitle>
                    <CardDescription>{format(movement.date, "dd MMM yyyy, HH:mm", { locale: es })}</CardDescription>
                  </div>
                  <Badge variant={getTypeBadgeVariant(movement.type) as any}>{getTypeText(movement.type)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {movement.quantity > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </span>
                  <span className="text-muted-foreground">
                    {ingredients.find((i) => i.id === movement.ingredientId)?.unit || ""}
                  </span>
                </div>
                {movement.notes && <p className="text-sm mt-2">{movement.notes}</p>}
                {movement.referenceId && (
                  <p className="text-xs text-muted-foreground mt-1">Ref: {movement.referenceId}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de formulario */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {movementType === "consumption" && "Registrar Consumo"}
              {movementType === "waste" && "Registrar Desperdicio"}
              {movementType === "adjustment" && "Ajustar Inventario"}
            </DialogTitle>
          </DialogHeader>
          <InventoryMovementForm type={movementType} onSuccess={() => setIsFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
