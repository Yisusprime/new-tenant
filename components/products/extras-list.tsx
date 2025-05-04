"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react"
import { useProducts, type Extra } from "./product-context"
import { ExtraForm } from "./extra-form"
import { DeleteConfirmDialog } from "../categories/delete-confirm-dialog"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"

interface ExtrasListProps {
  productId: string
}

export function ExtrasList({ productId }: ExtrasListProps) {
  const { products, deleteExtra, updateExtra } = useProducts()
  const [isAddingExtra, setIsAddingExtra] = useState(false)
  const [editingExtra, setEditingExtra] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [extraToDelete, setExtraToDelete] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  const product = products.find((p) => p.id === productId)
  const extras: Extra[] = product?.extras
    ? Object.keys(product.extras).map((key) => ({
        id: key,
        ...product.extras[key],
      }))
    : []

  const handleAddExtra = () => {
    setIsAddingExtra(true)
    setEditingExtra(null)
  }

  const handleEditExtra = (extraId: string) => {
    setEditingExtra(extraId)
    setIsAddingExtra(false)
  }

  const handleDeleteExtra = (extraId: string) => {
    setExtraToDelete(extraId)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteExtra = async () => {
    if (extraToDelete) {
      await deleteExtra(productId, extraToDelete)
      setExtraToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleImageError = (extraId: string) => {
    setImageError((prev) => ({ ...prev, [extraId]: true }))
  }

  const toggleExtraAvailability = async (extraId: string, currentValue: boolean) => {
    await updateExtra(productId, extraId, { available: !currentValue })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Extras / Complementos</h3>
        <Button size="sm" onClick={handleAddExtra}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Extra
        </Button>
      </div>

      {extras.length === 0 ? (
        <div className="text-center p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">No hay extras para este producto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {extras.map((extra) => (
            <Card key={extra.id} className={`overflow-hidden ${!extra.available ? "opacity-70" : ""}`}>
              <CardContent className="p-3 flex items-center">
                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                  {extra.imageUrl && !imageError[extra.id] ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={extra.imageUrl || "/placeholder.svg"}
                        alt={extra.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(extra.id)}
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{extra.name}</h4>
                    {!extra.available && <span className="text-xs text-muted-foreground ml-2">No disponible</span>}
                  </div>
                  {extra.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{extra.description}</p>
                  )}
                  <span className="text-xs font-medium mt-1 block">${extra.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 mr-2">
                    <Switch
                      checked={extra.available}
                      onCheckedChange={() => toggleExtraAvailability(extra.id, extra.available)}
                      size="sm"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEditExtra(extra.id)} className="h-7 w-7">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExtra(extra.id)}
                    className="h-7 w-7 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(isAddingExtra || editingExtra) && (
        <div className="mt-4">
          <ExtraForm
            productId={productId}
            extraId={editingExtra}
            onCancel={() => {
              setIsAddingExtra(false)
              setEditingExtra(null)
            }}
          />
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteExtra}
        title="Eliminar extra"
        description="¿Estás seguro de que quieres eliminar este extra? Esta acción no se puede deshacer."
      />
    </div>
  )
}
