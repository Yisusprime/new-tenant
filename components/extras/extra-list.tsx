"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, ImageIcon, Loader2 } from "lucide-react"
import { useExtras } from "./extra-context"
import { ExtraForm } from "./extra-form"
import { DeleteConfirmDialog } from "../categories/delete-confirm-dialog"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

export function ExtraList() {
  const { extras, loading, deleteExtra, updateExtra } = useExtras()
  const [isAddingExtra, setIsAddingExtra] = useState(false)
  const [editingExtra, setEditingExtra] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [extraToDelete, setExtraToDelete] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")

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
      await deleteExtra(extraToDelete)
      setExtraToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleImageError = (extraId: string) => {
    setImageError((prev) => ({ ...prev, [extraId]: true }))
  }

  const toggleExtraAvailability = async (extraId: string, currentValue: boolean) => {
    await updateExtra(extraId, { available: !currentValue })
  }

  const filteredExtras = extras.filter(
    (extra) =>
      extra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (extra.description && extra.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando extras...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Lista de Extras</h2>
            <Button onClick={handleAddExtra}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Extra
            </Button>
          </div>
          <div className="relative">
            <Input
              placeholder="Buscar extras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-full"
            />
          </div>
        </div>

        {extras.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay extras</h3>
              <p className="text-muted-foreground mb-4">Añade tu primer extra para complementar tus productos</p>
              <Button onClick={handleAddExtra}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Extra
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExtras.map((extra) => (
              <Card key={extra.id} className={`overflow-hidden ${!extra.available ? "opacity-70" : ""}`}>
                <CardContent className="p-4 flex items-center">
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted mr-4 flex-shrink-0">
                    {extra.imageUrl && !imageError[extra.id] ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={extra.imageUrl || "/placeholder.svg"}
                          alt={extra.name}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(extra.id)}
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{extra.name}</h3>
                      {!extra.available && <span className="text-xs text-muted-foreground ml-2">No disponible</span>}
                    </div>
                    {extra.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{extra.description}</p>
                    )}
                    <span className="text-sm font-medium mt-1 block">${extra.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1 mr-2">
                      <span className="text-xs text-muted-foreground">Disponible</span>
                      <Switch
                        checked={extra.available}
                        onCheckedChange={() => toggleExtraAvailability(extra.id, extra.available)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleEditExtra(extra.id)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExtra(extra.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        {(isAddingExtra || editingExtra) && (
          <ExtraForm
            extraId={editingExtra}
            onCancel={() => {
              setIsAddingExtra(false)
              setEditingExtra(null)
            }}
          />
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteExtra}
        title="Eliminar extra"
        description="¿Estás seguro de que quieres eliminar este extra? Esta acción no se puede deshacer y podría afectar a los productos que lo utilizan."
      />
    </div>
  )
}
