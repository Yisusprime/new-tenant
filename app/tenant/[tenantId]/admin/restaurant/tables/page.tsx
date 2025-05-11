"use client"

import { useState, useEffect } from "react"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash, TableIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { useBranch } from "@/lib/context/branch-context"
import { getTables, createTable, updateTable, deleteTable } from "@/lib/services/table-service"

export default function RestaurantTablesPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { toast } = useToast()
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<any[]>([])
  const [newTable, setNewTable] = useState({
    number: "",
    capacity: 4,
    isActive: true,
  })

  useEffect(() => {
    loadTables()
  }, [currentBranch])

  const loadTables = async () => {
    if (!currentBranch) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const tablesData = await getTables(tenantId, currentBranch.id)
      setTables(tablesData || [])
    } catch (error) {
      console.error("Error al cargar mesas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las mesas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = async () => {
    if (!currentBranch) return
    if (!newTable.number.trim()) {
      toast({
        title: "Error",
        description: "El número de mesa es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      await createTable(tenantId, currentBranch.id, {
        number: newTable.number,
        capacity: newTable.capacity,
        isActive: newTable.isActive,
      })

      toast({
        title: "Mesa creada",
        description: "La mesa se ha creado correctamente",
      })

      // Limpiar el formulario
      setNewTable({
        number: "",
        capacity: 4,
        isActive: true,
      })

      // Recargar las mesas
      loadTables()
    } catch (error) {
      console.error("Error al crear mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la mesa",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (tableId: string, isActive: boolean) => {
    if (!currentBranch) return

    try {
      await updateTable(tenantId, currentBranch.id, tableId, { isActive })

      // Actualizar la lista local
      setTables(tables.map((table) => (table.id === tableId ? { ...table, isActive } : table)))

      toast({
        title: isActive ? "Mesa activada" : "Mesa desactivada",
        description: `La mesa ha sido ${isActive ? "activada" : "desactivada"} correctamente`,
      })
    } catch (error) {
      console.error("Error al actualizar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la mesa",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!currentBranch) return

    if (!confirm("¿Estás seguro de que deseas eliminar esta mesa?")) {
      return
    }

    try {
      await deleteTable(tenantId, currentBranch.id, tableId)

      // Actualizar la lista local
      setTables(tables.filter((table) => table.id !== tableId))

      toast({
        title: "Mesa eliminada",
        description: "La mesa ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa",
        variant: "destructive",
      })
    }
  }

  if (loading && !tables.length) {
    return (
      <RestaurantConfigSteps tenantId={tenantId} currentStep="tables">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="tables">
      <div className="max-w-md space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Número de Mesa *</Label>
              <Input
                id="tableNumber"
                value={newTable.number}
                onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                placeholder="Ej: 1, A1, Mesa VIP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={newTable.capacity}
                onChange={(e) => setNewTable({ ...newTable, capacity: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={handleAddTable} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Mesa
              </Button>
            </div>
          </div>

          {tables.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Activa</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.number}</TableCell>
                      <TableCell>{table.capacity} personas</TableCell>
                      <TableCell>
                        <Switch
                          checked={table.isActive}
                          onCheckedChange={(checked) => handleToggleActive(table.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTable(table.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/20">
              <TableIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No hay mesas configuradas</h3>
              <p className="text-sm text-muted-foreground">
                Añade mesas para que tus clientes puedan hacer pedidos en el local.
              </p>
            </div>
          )}
        </div>
      </div>
    </RestaurantConfigSteps>
  )
}
