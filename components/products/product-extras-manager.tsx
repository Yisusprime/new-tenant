"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, ImageIcon, Settings } from "lucide-react"
import { useProducts, type ProductExtra } from "./product-context"
import { useExtras, type Extra } from "../extras/extra-context"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmDialog } from "../categories/delete-confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductExtrasManagerProps {
  productId: string
}

export function ProductExtrasManager({ productId }: ProductExtrasManagerProps) {
  const { products, addProductExtra, updateProductExtra, removeProductExtra } = useProducts()
  const { extras } = useExtras()
  const [selectedExtraId, setSelectedExtraId] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [extraToRemove, setExtraToRemove] = useState<string | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [extraToConfig, setExtraToConfig] = useState<string | null>(null)
  const [extraConfig, setExtraConfig] = useState<{
    included: boolean
    required: boolean
    price: string
  }>({
    included: false,
    required: false,
    price: "",
  })

  const product = products.find((p) => p.id === productId)
  const productExtras = product?.productExtras || {}

  // Obtener los extras que ya están asociados al producto
  const associatedExtraIds = Object.keys(productExtras)

  // Filtrar los extras disponibles (que no estén ya asociados)
  const availableExtras = extras.filter((extra) => !associatedExtraIds.includes(extra.id))

  const handleAddExtra = async () => {
    if (!selectedExtraId || selectedExtraId === "none") return

    const productExtra: ProductExtra = {
      extraId: selectedExtraId,
      included: false,
      required: false,
    }

    await addProductExtra(productId, productExtra)
    setSelectedExtraId("")
  }

  const handleRemoveExtra = (extraId: string) => {
    setExtraToRemove(extraId)
    setDeleteDialogOpen(true)
  }

  const confirmRemoveExtra = async () => {
    if (extraToRemove) {
      await removeProductExtra(productId, extraToRemove)
      setExtraToRemove(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleImageError = (extraId: string) => {
    setImageError((prev) => ({ ...prev, [extraId]: true }))
  }

  const openConfigDialog = (extraId: string) => {
    const productExtra = productExtras[extraId]
    setExtraToConfig(extraId)
    setExtraConfig({
      included: productExtra.included || false,
      required: productExtra.required || false,
      price: productExtra.price !== undefined ? productExtra.price.toString() : "",
    })
    setConfigDialogOpen(true)
  }

  const saveExtraConfig = async () => {
    if (!extraToConfig) return

    const updatedConfig: Partial<ProductExtra> = {
      included: extraConfig.included,
      required: extraConfig.required,
    }

    // Solo incluir el precio si se ha especificado
    if (extraConfig.price.trim() !== "") {
      updatedConfig.price = Number.parseFloat(extraConfig.price) || 0
    } else {
      // Si se ha borrado el precio, eliminamos la anulación del precio
      updatedConfig.price = undefined
    }

    await updateProductExtra(productId, extraToConfig, updatedConfig)
    setConfigDialogOpen(false)
    setExtraToConfig(null)
  }

  // Obtener el extra completo a partir de su ID
  const getExtraById = (extraId: string): Extra | undefined => {
    return extras.find((extra) => extra.id === extraId)
  }

  // Obtener el precio efectivo de un extra para este producto
  const getEffectivePrice = (extraId: string): number => {
    const productExtra = productExtras[extraId]
    const extra = getExtraById(extraId)

    if (!extra) return 0

    // Si hay un precio específico para este producto, usarlo
    if (productExtra.price !== undefined) {
      return productExtra.price
    }

    // De lo contrario, usar el precio base del extra
    return extra.price
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Extras / Complementos</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedExtraId} onValueChange={setSelectedExtraId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar extra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seleccionar extra</SelectItem>
              {availableExtras.map((extra) => (
                <SelectItem key={extra.id} value={extra.id}>
                  {extra.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAddExtra} disabled={!selectedExtraId || selectedExtraId === "none"}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>
      </div>

      {associatedExtraIds.length === 0 ? (
        <div className="text-center p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">No hay extras asociados a este producto</p>
        </div>
      ) : (
        <div className="space-y-2">
          {associatedExtraIds.map((extraId) => {
            const extra = getExtraById(extraId)
            const productExtra = productExtras[extraId]

            if (!extra) return null

            return (
              <Card key={extraId} className={`overflow-hidden ${!extra.available ? "opacity-70" : ""}`}>
                <CardContent className="p-3 flex items-center">
                  <div className="h-10 w-10 rounded-md overflow-hidden bg-muted mr-3 flex-shrink-0">
                    {extra.imageUrl && !imageError[extraId] ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={extra.imageUrl || "/placeholder.svg"}
                          alt={extra.name}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(extraId)}
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
                      {productExtra.included && (
                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Incluido</span>
                      )}
                      {productExtra.required && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Obligatorio</span>
                      )}
                      {!extra.available && <span className="text-xs text-muted-foreground ml-2">No disponible</span>}
                    </div>
                    {extra.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{extra.description}</p>
                    )}
                    <span className="text-xs font-medium mt-1 block">
                      ${getEffectivePrice(extraId).toFixed(2)}
                      {productExtra.price !== undefined && (
                        <span className="text-xs text-muted-foreground ml-2">(Precio personalizado)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openConfigDialog(extraId)} className="h-7 w-7">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExtra(extraId)}
                      className="h-7 w-7 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmRemoveExtra}
        title="Quitar extra"
        description="¿Estás seguro de que quieres quitar este extra del producto? Esta acción no eliminará el extra del sistema."
      />

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar extra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="included">Incluido por defecto</Label>
              <Switch
                id="included"
                checked={extraConfig.included}
                onCheckedChange={(checked) => setExtraConfig((prev) => ({ ...prev, included: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="required">Obligatorio</Label>
              <Switch
                id="required"
                checked={extraConfig.required}
                onCheckedChange={(checked) => setExtraConfig((prev) => ({ ...prev, required: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio personalizado (opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={extraConfig.price}
                  onChange={(e) => setExtraConfig((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Usar precio base"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">Deja en blanco para usar el precio base del extra</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveExtraConfig}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
