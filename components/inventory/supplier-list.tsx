"use client"

import { useState } from "react"
import { useSuppliers } from "./supplier-context"
import type { Supplier } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Mail, Phone, Plus, Search, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SupplierForm } from "./supplier-form"

export function SupplierList() {
  const { suppliers, loading, error, deleteSupplier } = useSuppliers()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)

  // Filtrar proveedores por término de búsqueda
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsFormDialogOpen(true)
  }

  const handleAddClick = () => {
    setSelectedSupplier(null)
    setIsFormDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedSupplier) {
      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Proveedores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Proveedor
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar proveedores..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron proveedores con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{supplier.name}</CardTitle>
                    <CardDescription>{supplier.contactName || "Sin contacto"}</CardDescription>
                  </div>
                  <Badge variant={supplier.isActive ? "outline" : "secondary"}>
                    {supplier.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supplier.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {supplier.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditClick(supplier)}>
                  <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(supplier)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el proveedor "{selectedSupplier?.name}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de formulario */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedSupplier ? "Editar Proveedor" : "Añadir Proveedor"}</DialogTitle>
          </DialogHeader>
          <SupplierForm supplier={selectedSupplier} onSuccess={() => setIsFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
