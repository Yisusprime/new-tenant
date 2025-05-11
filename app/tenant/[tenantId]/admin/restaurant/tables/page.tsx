"use client"

import { useState, useEffect } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { type Table, getTables, createTable, updateTable, deleteTable } from "@/lib/services/table-service"
import { Loader2, Plus, Pencil, Trash2, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

export default function TablesPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [tableNumber, setTableNumber] = useState("")
  const [tableCapacity, setTableCapacity] = useState("2")
  const [tableLocation, setTableLocation] = useState("")
  const [tableStatus, setTableStatus] = useState<"available" | "maintenance">("available")
  const [tableActive, setTableActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    loadTables()
  }, [tenantId, currentBranch])

  const handleOpenDialog = (table?: Table) => {
    if (table) {
      setIsEditing(true)
      setCurrentTable(table)
      setTableNumber(table.number)
      setTableCapacity(table.capacity.toString())
      setTableLocation(table.location || "")
      setTableStatus(table.status === "occupied" || table.status === "reserved" ? "available" : table.status)
      setTableActive(table.isActive)
    } else {
      setIsEditing(false)
      setCurrentTable(null)
      setTableNumber("")
      setTableCapacity("2")
      setTableLocation("")
      setTableStatus("available")
      setTableActive(true)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!currentBranch) return
    if (!tableNumber.trim()) {
      toast({
        title: "Error",
        description: "El número de mesa es obligatorio",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const tableData = {
        number: tableNumber.trim(),
        capacity: Number.parseInt(tableCapacity) || 2,
        location: tableLocation.trim() || undefined,
        status: tableStatus,
        isActive: tableActive,
      }

      if (isEditing && currentTable) {
        await updateTable(tenantId, currentBranch.id, currentTable.id, tableData)
        toast({
          title: "Mesa actualizada",
          description: `La mesa ${tableNumber} ha sido actualizada correctamente`,
        })
      } else {
        await createTable(tenantId, currentBranch.id, tableData as any)
        toast({
          title: "Mesa creada",
          description: `La mesa ${tableNumber} ha sido creada correctamente`,
        })
      }

      setIsDialogOpen(false)
      loadTables()
    } catch (error) {
      console.error("Error al guardar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la mesa",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (table: Table) => {
    if (!currentBranch) return
    if (!confirm(`¿Estás seguro de eliminar la mesa ${table.number}?`)) return

    try {
      await deleteTable(tenantId, currentBranch.id, table.id)
      toast({
        title: "Mesa eliminada",
        description: `La mesa ${table.number} ha sido eliminada correctamente`,
      })
      loadTables()
    } catch (error) {
      console.error("Error al eliminar mesa:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la mesa",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
      available: { label: "Disponible", variant: "default" },
      occupied: { label: "Ocupada", variant: "destructive" },
      reserved: { label: "Reservada", variant: "secondary" },
      maintenance: { label: "Mantenimiento", variant: "outline" },
    }
    const statusInfo = statusMap[status] || { label: status, variant: "default" }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración de Mesas</h1>
        <Button onClick={() => handleOpenDialog()} disabled={!currentBranch}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Mesa
        </Button>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <Card>
          <CardHeader>
            <CardTitle>Mesas</CardTitle>
            <CardDescription>Administra las mesas de tu restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No hay mesas configuradas</p>
                <Button onClick={() => handleOpenDialog()}>Crear Mesa</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Mesa</th>
                      <th className="text-left py-3 px-4">Capacidad</th>
                      <th className="text-left py-3 px-4">Ubicación</th>
                      <th className="text-left py-3 px-4">Estado</th>
                      <th className="text-left py-3 px-4">Activa</th>
                      <th className="text-right py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map((table) => (
                      <tr key={table.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{table.number}</td>
                        <td className="py-3 px-4">{table.capacity} personas</td>
                        <td className="py-3 px-4">{table.location || "-"}</td>
                        <td className="py-3 px-4">{getStatusBadge(table.status)}</td>
                        <td className="py-3 px-4">
                          {table.isActive ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDialog(table)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(table)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Mesa" : "Nueva Mesa"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica la información de la mesa seleccionada"
                : "Completa la información para crear una nueva mesa"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">Número de Mesa</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ej: 1, 2A, VIP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableCapacity">Capacidad (personas)</Label>
              <Input
                id="tableCapacity"
                type="number"
                min="1"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableLocation">Ubicación (opcional)</Label>
              <Input
                id="tableLocation"
                value={tableLocation}
                onChange={(e) => setTableLocation(e.target.value)}
                placeholder="Ej: Terraza, Interior, Ventana"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableStatus">Estado</Label>
              <Select value={tableStatus} onValueChange={(value) => setTableStatus(value as any)}>
                <SelectTrigger id="tableStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="tableActive" checked={tableActive} onCheckedChange={setTableActive} />
              <Label htmlFor="tableActive">Mesa activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
