"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CashCategory } from "@/lib/types/cashier"
import { getCashCategories, createCashCategory } from "@/lib/services/cashier-service"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusIcon } from "lucide-react"

interface CategoriesDialogProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
}

export function CategoriesDialog({ isOpen, onClose, tenantId }: CategoriesDialogProps) {
  const [categories, setCategories] = useState<CashCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">("expense")
  const [newCategoryColor, setNewCategoryColor] = useState("#6366F1")
  const [isCreating, setIsCreating] = useState(false)

  const loadCategories = async () => {
    if (!tenantId) return

    setLoading(true)
    try {
      const cats = await getCashCategories(tenantId)
      setCategories(cats)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen, tenantId])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      await createCashCategory(tenantId, {
        name: newCategoryName,
        type: newCategoryType,
        color: newCategoryColor,
      })

      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada correctamente",
      })

      setNewCategoryName("")
      loadCategories()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al crear la categoría",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <DialogDescription>Administra las categorías para los movimientos de caja.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <form onSubmit={handleCreateCategory} className="space-y-4 border p-4 rounded-md">
            <h3 className="text-sm font-medium">Crear nueva categoría</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryName">Nombre</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={isCreating}
                  placeholder="Ej: Salarios, Servicios, etc."
                />
              </div>
              <div>
                <Label htmlFor="categoryType">Tipo</Label>
                <Select
                  value={newCategoryType}
                  onValueChange={(value) => setNewCategoryType(value as "income" | "expense")}
                  disabled={isCreating}
                >
                  <SelectTrigger id="categoryType">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="categoryColor">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="categoryColor"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  disabled={isCreating}
                  className="w-12 h-9 p-1"
                />
                <Button type="submit" disabled={isCreating} className="ml-auto">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {isCreating ? "Creando..." : "Crear Categoría"}
                </Button>
              </div>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium mb-2">Categorías existentes</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Color</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Cargando categorías...
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No hay categorías registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge variant={category.type === "income" ? "success" : "destructive"}>
                            {category.type === "income" ? "Ingreso" : "Egreso"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color || "#6366F1" }}
                            />
                            <span>{category.color || "#6366F1"}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
