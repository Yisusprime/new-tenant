"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { TableInfo } from "@/lib/types/order"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TableManagementProps {
  tables: TableInfo[]
  onCreateTable: (table: Omit<TableInfo, "id">) => Promise<string>
  onUpdateTable: (tableId: string, updates: Partial<TableInfo>) => Promise<void>
  onDeleteTable: (tableId: string) => Promise<void>
  occupiedTableIds?: string[]
}

export function TableManagement({
  tables,
  onCreateTable,
  onUpdateTable,
  onDeleteTable,
  occupiedTableIds = [],
}: TableManagementProps) {
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: 4,
  })

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isCreateDialogOpen) {
      setFormData({ name: "", capacity: 4 })
    }
  }, [isCreateDialogOpen])

  // Set form data when editing a table
  useEffect(() => {
    if (selectedTable && isEditDialogOpen) {
      setFormData({
        name: selectedTable.name,
        capacity: selectedTable.capacity,
      })
    }
  }, [selectedTable, isEditDialogOpen])

  const handleCreateTable = async () => {
    try {
      await onCreateTable(formData)
      setIsCreateDialogOpen(false)
      toast({
        title: "Mesa creada",
        description: "La mesa ha sido creada exitosamente.",
      })
    } catch (error) {
      console.error("Error creating table:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la mesa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTable = async () => {
    if (!selectedTable) return

    try {
      await onUpdateTable(selectedTable.id, formData)
      setIsEditDialogOpen(false)
      toast({
        title: "Mesa actualizada",
        description: "La mesa ha sido actualizada exitosamente.",
      })
    } catch (error) {
      console.error("Error updating table:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la mesa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTable = async () => {
    if (!selectedTable) return

    try {
      await onDeleteTable(selectedTable.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Mesa eliminada",
        description: "La mesa ha sido eliminada exitosamente.",
      })
    } catch (error) {
      console.error("Error deleting table:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const isTableOccupied = (tableId: string) => {
    return occupiedTableIds.includes(tableId)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestión de Mesas</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Mesa</DialogTitle>
              <DialogDescription>Ingresa los detalles para crear una nueva mesa.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Ej: Mesa 1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacidad
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTable}>Crear Mesa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No hay mesas configuradas. Crea una nueva mesa para comenzar.
          </div>
        ) : (
          tables.map((table) => {
            const occupied = isTableOccupied(table.id)
            return (
              <Card key={table.id} className={`${occupied ? "border-primary bg-primary/5" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Capacidad: {table.capacity} personas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {occupied ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                        Ocupada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Disponible
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Dialog
                    open={isEditDialogOpen && selectedTable?.id === table.id}
                    onOpenChange={(open) => {
                      setIsEditDialogOpen(open)
                      if (open) setSelectedTable(table)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Mesa</DialogTitle>
                        <DialogDescription>Modifica los detalles de la mesa.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-name" className="text-right">
                            Nombre
                          </Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-capacity" className="text-right">
                            Capacidad
                          </Label>
                          <Input
                            id="edit-capacity"
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) =>
                              setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 1 })
                            }
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleUpdateTable}>Guardar Cambios</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isDeleteDialogOpen && selectedTable?.id === table.id}
                    onOpenChange={(open) => {
                      setIsDeleteDialogOpen(open)
                      if (open) setSelectedTable(table)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="text-destructive" disabled={occupied}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Eliminar Mesa</DialogTitle>
                        <DialogDescription>
                          ¿Estás seguro de que deseas eliminar esta mesa? Esta acción no se puede deshacer.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteTable}>
                          Eliminar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Componente Badge que faltaba
function Badge({ children, variant, className }: { children: React.ReactNode; variant: string; className?: string }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"

  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input bg-background",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    success: "bg-green-100 text-green-800 border border-green-200",
  }

  const classes = `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${className || ""}`

  return <span className={classes}>{children}</span>
}
