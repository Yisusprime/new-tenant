"use client"

import type React from "react"

import { useState } from "react"
import { useBranch } from "@/lib/context/branch-context"
import { createBranch, updateBranch } from "@/lib/services/branch-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function BranchesPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { branches, currentBranch, setCurrentBranch, loading } = useBranch()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked })
  }

  const handleOpenDialog = (branch?: any) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        isActive: branch.isActive !== false,
      })
    } else {
      setEditingBranch(null)
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingBranch) {
        // Actualizar sucursal existente
        await updateBranch(tenantId, editingBranch.id, formData)
        toast({
          title: "Sucursal actualizada",
          description: "La sucursal se ha actualizado correctamente",
        })
      } else {
        // Crear nueva sucursal
        await createBranch(tenantId, formData)
        toast({
          title: "Sucursal creada",
          description: "La sucursal se ha creado correctamente",
        })
      }

      // Cerrar diálogo y recargar la página para ver los cambios
      setIsDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error al guardar sucursal:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la sucursal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sucursales</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Sucursal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Sucursales</CardTitle>
          <CardDescription>Gestiona las sucursales de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Cargando sucursales...</p>
              {/* Añadir un timeout para mostrar un mensaje si la carga tarda demasiado */}
              {setTimeout(() => {
                const loadingElement = document.getElementById("loading-timeout-message")
                if (loadingElement) loadingElement.style.display = "block"
              }, 5000) && (
                <p id="loading-timeout-message" className="text-yellow-600 mt-4" style={{ display: "none" }}>
                  La carga está tardando más de lo esperado. Si continúa, intenta refrescar la página.
                </p>
              )}
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hay sucursales configuradas</p>
              <Button onClick={() => handleOpenDialog()}>Añadir Primera Sucursal</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id} className={currentBranch?.id === branch.id ? "bg-primary/10" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {currentBranch?.id === branch.id && <MapPin className="h-4 w-4 text-primary mr-2" />}
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.phone || "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${branch.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {branch.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentBranch(branch)}
                          disabled={currentBranch?.id === branch.id}
                        >
                          Seleccionar
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(branch)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para crear/editar sucursal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</DialogTitle>
            <DialogDescription>
              {editingBranch
                ? "Actualiza la información de la sucursal"
                : "Completa los datos para crear una nueva sucursal"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Sucursal *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Dirección *</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isActive">Sucursal Activa</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editingBranch ? "Actualizar Sucursal" : "Crear Sucursal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
