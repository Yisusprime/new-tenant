"use client"

import { useState } from "react"
import { usePurchases } from "./purchase-context"
import type { Purchase } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Eye, Plus, Search, Trash2, TruckIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PurchaseForm } from "./purchase-form"
import { PurchaseDetails } from "./purchase-details"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PurchaseReceiveForm } from "./purchase-receive-form"

export function PurchaseList() {
  const { purchases, loading, error, deletePurchase } = usePurchases()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)

  // Filtrar compras por término de búsqueda
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsDeleteDialogOpen(true)
  }

  const handleEditClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsFormDialogOpen(true)
  }

  const handleDetailsClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsDetailsDialogOpen(true)
  }

  const handleReceiveClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setIsReceiveDialogOpen(true)
  }

  const handleAddClick = () => {
    setSelectedPurchase(null)
    setIsFormDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedPurchase) {
      await deletePurchase(selectedPurchase.id)
      setIsDeleteDialogOpen(false)
    }
  }

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success"
      case "partial":
        return "warning"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Función para obtener el texto del estado en español
  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado"
      case "partial":
        return "Parcial"
      case "cancelled":
        return "Cancelado"
      default:
        return "Pendiente"
    }
  }

  // Función para obtener el color de la insignia según el estado de pago
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "partial":
        return "warning"
      default:
        return "outline"
    }
  }

  // Función para obtener el texto del estado de pago en español
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagado"
      case "partial":
        return "Parcial"
      default:
        return "Pendiente"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Compras</h2>
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
        <h2 className="text-2xl font-bold">Compras</h2>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Compra
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar compras..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive">{error}</p>}

      {filteredPurchases.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron compras con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPurchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{purchase.supplierName}</CardTitle>
                    <CardDescription>{format(purchase.orderDate, "dd MMM yyyy", { locale: es })}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(purchase.status) as any}>
                    {getStatusText(purchase.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">${purchase.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pago:</span>
                    <Badge variant={getPaymentStatusBadgeVariant(purchase.paymentStatus) as any} className="text-xs">
                      {getPaymentStatusText(purchase.paymentStatus)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {purchase.items.length} {purchase.items.length === 1 ? "ítem" : "ítems"}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDetailsClick(purchase)}>
                  <Eye className="mr-2 h-4 w-4" /> Detalles
                </Button>
                {purchase.status === "pending" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(purchase)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="default" size="sm" onClick={() => handleReceiveClick(purchase)}>
                      <TruckIcon className="mr-2 h-4 w-4" /> Recibir
                    </Button>
                  </>
                )}
                {(purchase.status === "pending" || purchase.status === "partial") && (
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(purchase)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                  </Button>
                )}
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
              ¿Estás seguro de que deseas eliminar esta compra? Esta acción no se puede deshacer.
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedPurchase ? "Editar Compra" : "Nueva Compra"}</DialogTitle>
          </DialogHeader>
          <PurchaseForm purchase={selectedPurchase} onSuccess={() => setIsFormDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Diálogo de detalles */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Compra</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <PurchaseDetails purchase={selectedPurchase} onClose={() => setIsDetailsDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de recepción */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Recibir Compra</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <PurchaseReceiveForm purchase={selectedPurchase} onSuccess={() => setIsReceiveDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
