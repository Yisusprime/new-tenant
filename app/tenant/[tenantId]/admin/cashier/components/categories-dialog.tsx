"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { getCashCategories, createCashCategory } from "@/lib/services/cashier-service"
import type { CashCategory } from "@/lib/types/cashier"
import { PlusIcon, Trash2Icon } from "lucide-react"

interface CategoriesDialogProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
}

export function CategoriesDialog({ isOpen, onClose, tenantId }: CategoriesDialogProps) {
  const [categories, setCategories] = useState<CashCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#6366F1",
  })

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCashCategories(tenantId)
      setCategories(data)
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

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      await createCashCategory(tenantId, newCategory)
      toast({
        title: "Categoría creada",
        description: `La categoría "${newCategory.name}" ha sido creada exitosamente.`,
      })
      setNewCategory({
        name: "",
        type: "expense",
        color: "#6366F1",
      })
      loadCategories()
    } catch (error) {
      console.error("Error al crear categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Categorías de movimientos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="categoryName">Nueva categoría</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nombre de la categoría"
              />
            </div>
            <Select
              value={newCategory.type}
              onValueChange={(value: "income" | "expense") => setNewCategory({ ...newCategory, type: value })}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Egreso</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              className="w-12 h-10 p-1"
            />
            <Button onClick={handleCreateCategory} className="ml-2">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-md">
            <div className="p-2 bg-muted font-medium flex items-center">
              <span className="flex-1">Nombre</span>
              <span className="w-24 text-center">Tipo</span>
              <span className="w-16 text-center">Color</span>
              <span className="w-10"></span>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Cargando categorías...</div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No hay categorías definidas</div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="p-2 flex items-center">
                    <div className="flex-1 flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: category.color || "#6366F1" }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="w-24 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          category.type === "income" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {category.type === "income" ? "Ingreso" : "Egreso"}
                      </span>
                    </div>
                    <div className="w-16 flex justify-center">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: category.color || "#6366F1" }}
                      ></div>
                    </div>
                    <div className="w-10 flex justify-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
