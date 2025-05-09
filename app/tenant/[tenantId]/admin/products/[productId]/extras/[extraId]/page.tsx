"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useBranch } from "@/lib/context/branch-context"
import {
  getProduct,
  getProductExtra,
  createProductExtra,
  updateProductExtra,
  deleteProductExtraOption,
  type ProductExtraOption,
} from "@/lib/services/product-service"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ProductExtraPage({
  params,
}: {
  params: { tenantId: string; productId: string; extraId: string }
}) {
  const router = useRouter()
  const { currentBranch } = useBranch()
  const isNew = params.extraId === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)

  // Campos del formulario
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [multipleSelection, setMultipleSelection] = useState(false)
  const [maxSelections, setMaxSelections] = useState("")
  const [active, setActive] = useState(true)
  const [order, setOrder] = useState("0")

  // Opciones del extra
  const [options, setOptions] = useState<(ProductExtraOption & { isNew?: boolean })[]>([])
  const [newOptionName, setNewOptionName] = useState("")
  const [newOptionPrice, setNewOptionPrice] = useState("")

  // Estado para eliminar opción
  const [optionToDelete, setOptionToDelete] = useState<ProductExtraOption | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (currentBranch) {
      loadProduct()
      if (!isNew) {
        loadExtra()
      } else {
        setLoading(false)
      }
    }
  }, [currentBranch, isNew])

  const loadProduct = async () => {
    if (!currentBranch) return

    try {
      const productData = await getProduct(params.tenantId, currentBranch.id, params.productId)
      if (productData) {
        setProduct(productData)
      } else {
        toast({
          title: "Error",
          description: "Producto no encontrado",
          variant: "destructive",
        })
        router.push(`/tenant/${params.tenantId}/admin/products`)
      }
    } catch (error) {
      console.error("Error al cargar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      })
    }
  }

  const loadExtra = async () => {
    if (!currentBranch) return

    setLoading(true)
    try {
      const extra = await getProductExtra(params.tenantId, currentBranch.id, params.productId, params.extraId)

      if (extra) {
        setName(extra.name)
        setDescription(extra.description || "")
        setIsRequired(extra.isRequired)
        setMultipleSelection(extra.multipleSelection)
        setMaxSelections(extra.maxSelections?.toString() || "")
        setActive(extra.active)
        setOrder(extra.order.toString())
        setOptions(extra.options || [])
      } else {
        toast({
          title: "Error",
          description: "Extra no encontrado",
          variant: "destructive",
        })
        router.push(`/tenant/${params.tenantId}/admin/products/${params.productId}/extras`)
      }
    } catch (error) {
      console.error("Error al cargar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el extra",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (!newOptionName || !newOptionPrice) {
      toast({
        title: "Error",
        description: "Debes ingresar un nombre y precio para la opción",
        variant: "destructive",
      })
      return
    }

    const newOption = {
      id: `temp_${Date.now()}`,
      name: newOptionName,
      price: Number.parseFloat(newOptionPrice),
      order: options.length,
      active: true,
      isNew: true,
    }

    setOptions([...options, newOption])
    setNewOptionName("")
    setNewOptionPrice("")
  }

  const handleDeleteOption = async () => {
    if (!optionToDelete) return

    if (isNew || optionToDelete.isNew) {
      // Si es una opción nueva o estamos creando un nuevo extra, solo la eliminamos del estado
      setOptions(options.filter((o) => o.id !== optionToDelete.id))
      setOptionToDelete(null)
      return
    }

    if (!currentBranch) return

    setIsDeleting(true)
    try {
      await deleteProductExtraOption(
        params.tenantId,
        currentBranch.id,
        params.productId,
        params.extraId,
        optionToDelete.id,
      )

      setOptions(options.filter((o) => o.id !== optionToDelete.id))
      toast({
        title: "Opción eliminada",
        description: "La opción ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar opción:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la opción",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOptionToDelete(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal",
        variant: "destructive",
      })
      return
    }

    if (!name || options.length === 0) {
      toast({
        title: "Error",
        description: "Debes ingresar un nombre y al menos una opción",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Preparar las opciones para guardar
      const optionsForSave = options.map((option) => ({
        name: option.name,
        price: option.price,
        order: option.order,
        active: option.active,
        ...(option.id && !option.isNew ? { id: option.id } : {}),
      }))

      const extraData = {
        name,
        description,
        isRequired,
        multipleSelection,
        maxSelections: maxSelections ? Number.parseInt(maxSelections) : undefined,
        active,
        order: Number.parseInt(order) || 0,
        options: optionsForSave,
      }

      if (isNew) {
        await createProductExtra(params.tenantId, currentBranch.id, params.productId, extraData)
        toast({
          title: "Extra creado",
          description: "El extra ha sido creado correctamente",
        })
      } else {
        await updateProductExtra(params.tenantId, currentBranch.id, params.productId, params.extraId, extraData)
        toast({
          title: "Extra actualizado",
          description: "El extra ha sido actualizado correctamente",
        })
      }

      router.push(`/tenant/${params.tenantId}/admin/products/${params.productId}/extras`)
    } catch (error) {
      console.error("Error al guardar extra:", error)
      toast({
        title: "Error",
        description: `No se pudo ${isNew ? "crear" : "actualizar"} el extra`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/tenant/${params.tenantId}/admin/products/${params.productId}/extras`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Extras
        </Button>
        <h1 className="text-2xl font-bold">{isNew ? "Nuevo Extra" : "Editar Extra"}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{product?.name}</CardTitle>
          <CardDescription>{product?.description || "Sin descripción"}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Crear Extra" : "Editar Extra"}</CardTitle>
          <CardDescription>Configura las opciones adicionales para este producto</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Extra *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Tamaño, Sabor, Toppings"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe este grupo de opciones..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Orden</Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  {multipleSelection && (
                    <div>
                      <Label htmlFor="maxSelections">Máximo de Selecciones</Label>
                      <Input
                        id="maxSelections"
                        type="number"
                        min="0"
                        value={maxSelections}
                        onChange={(e) => setMaxSelections(e.target.value)}
                        placeholder="Ilimitado"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isRequired" className="cursor-pointer">
                      Selección Obligatoria
                    </Label>
                    <Switch id="isRequired" checked={isRequired} onCheckedChange={setIsRequired} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="multipleSelection" className="cursor-pointer">
                      Selección Múltiple
                    </Label>
                    <Switch id="multipleSelection" checked={multipleSelection} onCheckedChange={setMultipleSelection} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active" className="cursor-pointer">
                      Activo
                    </Label>
                    <Switch id="active" checked={active} onCheckedChange={setActive} />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Opciones</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <Label htmlFor="optionName">Nombre</Label>
                      <Input
                        id="optionName"
                        value={newOptionName}
                        onChange={(e) => setNewOptionName(e.target.value)}
                        placeholder="Ej: Grande, Chocolate, Extra queso"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionPrice">Precio</Label>
                      <div className="flex">
                        <Input
                          id="optionPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newOptionPrice}
                          onChange={(e) => setNewOptionPrice(e.target.value)}
                          placeholder="0.00"
                        />
                        <Button type="button" onClick={addOption} className="ml-2">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {options.length === 0 ? (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-gray-500">No hay opciones agregadas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {options.map((option, index) => (
                          <TableRow key={option.id}>
                            <TableCell>
                              <GripVertical className="h-4 w-4 text-gray-400" />
                            </TableCell>
                            <TableCell>{option.name}</TableCell>
                            <TableCell>${option.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setOptionToDelete(option)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : isNew ? "Crear Extra" : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar opción */}
      <Dialog open={!!optionToDelete} onOpenChange={(open) => !open && setOptionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la opción "{optionToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOptionToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteOption} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
