"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { getTables, createTable, updateTable, deleteTable, type Table } from "@/lib/services/table-service"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"

export default function TablesConfigPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({
    number: "",
    capacity: 4,
    isActive: true,
    location: "",
  })

  useEffect(() => {
    if (currentBranch) {
      loadTables()
    } else {
      setLoading(false)
    }
  }, [tenantId, currentBranch])

  const loadTables = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      const tablesData = await getTables(tenantId, currentBranch.id)
      setTables(tablesData)
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

  const handleCreateTable = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      await createTable(tenantId, currentBranch.id, {
        number: formData.number,
        capacity: formData.capacity,
        isActive: formData.isActive,
        status: "available",
        location: formData.location || undefined,
      })

      toast({
        title: "Mesa creada",
        description: `La mesa ${formData.number} ha sido creada correctamente`,
      })

      setCreateDialogOpen(false)
      resetForm()
      loadTables()

      // Marcar el paso como completado en localStorage
      const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
      const savedCompletedSteps = localStorage.getItem(branchKey)
      const completedSteps = savedCompletedSteps ? JSON.parse(savedCompletedSteps) : []
      if (!completedSteps.includes("tables")) {
        completedSteps.push("tables")
        localStorage.setItem(branchKey, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error("Error al crear mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la mesa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditTable = async () => {
    if (!currentBranch || !selectedTable) return

    try {
      setLoading(true)
      await updateTable(tenantId, currentBranch.id, selectedTable.id, {
        number: formData.number,
        capacity: formData.capacity,
        isActive: formData.isActive,
        location: formData.location || undefined,
      })

      toast({
        title: "Mesa actualizada",
        description: `La mesa ${formData.number} ha sido actualizada correctamente`,
      })

      setEditDialogOpen(false)
      resetForm()
      loadTables()
    } catch (error) {
      console.error("Error al actualizar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la mesa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async () => {
    if (!currentBranch || !selectedTable) return

    try {
      setLoading(true)
      await deleteTable(tenantId, currentBranch.id, selectedTable.id)

      toast({
        title: "Mesa eliminada",
        description: `La mesa ${selectedTable.number} ha sido eliminada correctamente`,
      })

      setDeleteDialogOpen(false)
      setSelectedTable(null)
      loadTables()
    } catch (error) {
      console.error("Error al eliminar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      number: "",
      capacity: 4,
      isActive: true,
      location: "",
    })
  }

  const openEditDialog = (table: Table) => {
    setSelectedTable(table)
    setFormData({
      number: table.number,
      capacity: table.capacity,
      isActive: table.isActive,
      location: table.location || "",
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (table: Table) => {
    setSelectedTable(table)
    setDeleteDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "Disponible", className: "bg-green-100 text-green-800" },
      occupied: { label: "Ocupada", className: "bg-red-100 text-red-800" },
      reserved: { label: "Reservada", className: "bg-blue-100 text-blue-800" },
      maintenance: { label: "Mantenimiento", className: "bg-yellow-100 text-yellow-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <span className={`px-2 py-1 rounded-full text-xs ${config.className}`}>{config.label}</span>
  }

  const handleSaveAndContinue = async () => {
    if (!currentBranch) return

    try {
      // Marcar el paso como completado en localStorage
      const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
      const savedCompletedSteps = localStorage.getItem(branchKey)
      const completedSteps = savedCompletedSteps ? JSON.parse(savedCompletedSteps) : []
      if (!completedSteps.includes("tables")) {
        completedSteps.push("tables")
        localStorage.setItem(branchKey, JSON.stringify(completedSteps))
      }

      // Redirigir a la página de configuración del restaurante
      router.push(`/tenant/${tenantId}/admin/restaurant`)
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración de Mesas</h1>
        <Button onClick={() => router.push(`/tenant/${tenantId}/admin/restaurant`)}>Volver</Button>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Mesas - Sucursal: {currentBranch.name}</CardTitle>
              <CardDescription>
                Configura las mesas disponibles en tu restaurante para gestionar los pedidos por mesa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">
                  {tables.length} {tables.length === 1 ? "mesa configurada" : "mesas configuradas"}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Mesa
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tables.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-gray-500 mb-4">No hay mesas configuradas</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Mesa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <Card key={table.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                            <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(table)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(table)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`h-3 w-3 rounded-full ${table.isActive ? "bg-green-500" : "bg-gray-300"}`}
                            ></span>
                            <span className="text-sm">{table.isActive ? "Activa" : "Inactiva"}</span>
                          </div>
                          <div>{getStatusBadge(table.status)}</div>
                        </div>
                        {table.location && <p className="text-sm text-gray-500 mt-2">Ubicación: {table.location}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveAndContinue}>Guardar y Continuar</Button>
              </div>
            </CardContent>
          </Card>

          <RestaurantConfigSteps
            currentStep="tables"
            tenantId={tenantId}
            branchId={currentBranch.id}
            onComplete={handleSaveAndContinue}
          />

          {/* Diálogo para crear mesa */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir Nueva Mesa</DialogTitle>
                <DialogDescription>Completa la información para crear una nueva mesa.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número de Mesa</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="Ej: 1, 2, A1, B2..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad (personas)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación (opcional)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Terraza, Salón principal..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Mesa activa</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTable} disabled={loading || !formData.number}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Mesa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para editar mesa */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Mesa</DialogTitle>
                <DialogDescription>Actualiza la información de la mesa.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Número de Mesa</Label>
                  <Input
                    id="edit-number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacidad (personas)</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Ubicación (opcional)</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Terraza, Salón principal..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Mesa activa</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleEditTable} disabled={loading || !formData.number}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Actualizar Mesa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para eliminar mesa */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la mesa {selectedTable?.number} y no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTable} className="bg-red-600 hover:bg-red-700">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
