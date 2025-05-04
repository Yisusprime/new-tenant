"use client"

import { useState } from "react"
import { useTableContext } from "./table-context"
import { useOrderContext } from "./order-context"
import type { Table, TableStatus } from "@/lib/types/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Users, Coffee } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export const TableList = () => {
  const { tables, loading, error, addTable, updateTable, deleteTable } = useTableContext()
  const { getOrdersByTable } = useOrderContext()
  const { toast } = useToast()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)

  const [newTable, setNewTable] = useState<Omit<Table, "id" | "createdAt" | "updatedAt">>({
    number: 1,
    capacity: 4,
    status: "available",
    location: "Main",
  })

  const handleAddTable = async () => {
    try {
      await addTable(newTable)
      setIsAddDialogOpen(false)
      setNewTable({
        number: Math.max(...tables.map((t) => t.number), 0) + 1,
        capacity: 4,
        status: "available",
        location: "Main",
      })
      toast({
        title: "Mesa añadida",
        description: `Mesa ${newTable.number} añadida correctamente.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo añadir la mesa.",
        variant: "destructive",
      })
    }
  }

  const handleEditTable = async () => {
    if (!selectedTable) return

    try {
      await updateTable(selectedTable.id, {
        number: selectedTable.number,
        capacity: selectedTable.capacity,
        status: selectedTable.status,
        location: selectedTable.location,
      })
      setIsEditDialogOpen(false)
      toast({
        title: "Mesa actualizada",
        description: `Mesa ${selectedTable.number} actualizada correctamente.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la mesa.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTable = async () => {
    if (!selectedTable) return

    try {
      await deleteTable(selectedTable.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Mesa eliminada",
        description: `Mesa ${selectedTable.number} eliminada correctamente.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "occupied":
        return "Ocupada"
      case "reserved":
        return "Reservada"
      case "maintenance":
        return "Mantenimiento"
      default:
        return status
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Cargando mesas...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Mesas</h2>
        <Button
          onClick={() => {
            setNewTable({
              number: Math.max(...tables.map((t) => t.number), 0) + 1,
              capacity: 4,
              status: "available",
              location: "Main",
            })
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir Mesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => {
          const tableOrders = getOrdersByTable(table.id)
          const hasActiveOrders = tableOrders.length > 0

          return (
            <Card key={table.id} className={`overflow-hidden ${table.status === "occupied" ? "border-red-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">Mesa {table.number}</h3>
                      <Badge
                        variant={table.status === "available" ? "outline" : "default"}
                        className={getStatusColor(table.status)}
                      >
                        {getStatusText(table.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{table.capacity} personas</span>
                    </div>
                    <div className="text-sm text-gray-500">{table.location}</div>

                    {hasActiveOrders && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          {tableOrders.length} {tableOrders.length === 1 ? "pedido activo" : "pedidos activos"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTable(table)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTable(table)
                        setIsDeleteDialogOpen(true)
                      }}
                      disabled={hasActiveOrders}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Mesa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable({ ...newTable, number: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={newTable.location}
                onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={newTable.status}
                onValueChange={(value) => setNewTable({ ...newTable, status: value as TableStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Ocupada</SelectItem>
                  <SelectItem value="reserved">Reservada</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTable}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mesa</DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Número</Label>
                  <Input
                    id="edit-number"
                    type="number"
                    value={selectedTable.number}
                    onChange={(e) => setSelectedTable({ ...selectedTable, number: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacidad</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={selectedTable.capacity}
                    onChange={(e) => setSelectedTable({ ...selectedTable, capacity: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Input
                  id="edit-location"
                  value={selectedTable.location}
                  onChange={(e) => setSelectedTable({ ...selectedTable, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={selectedTable.status}
                  onValueChange={(value) => setSelectedTable({ ...selectedTable, status: value as TableStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Ocupada</SelectItem>
                    <SelectItem value="reserved">Reservada</SelectItem>
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTable}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Table Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Mesa</DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="py-4">
              <p>
                ¿Estás seguro de que deseas eliminar la Mesa {selectedTable.number}? Esta acción no se puede deshacer.
              </p>
            </div>
          )}
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
    </div>
  )
}
