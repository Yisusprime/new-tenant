"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import {
  type ProductExtra,
  createProduct,
  updateProduct,
  getProduct,
  getProductExtras,
} from "@/lib/services/product-service"
import { type Category, type Subcategory, getCategories, getCategory } from "@/lib/services/category-service"
import { ExtrasSelector } from "./extras-selector"

// Esquema de validación para el formulario
const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  discountPrice: z.coerce.number().min(0, "El precio con descuento debe ser mayor o igual a 0").optional().nullable(),
  categoryId: z.string().min(1, "La categoría es requerida"),
  subcategoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  availableExtras: z.array(z.string()).optional().nullable(),
  stock: z.coerce.number().min(0, "El stock debe ser mayor o igual a 0").optional().nullable(),
  sku: z.string().optional().nullable(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  tenantId: string
  branchId: string
  productId?: string
}

export function ProductForm({ tenantId, branchId, productId }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!productId

  // Inicializar formulario
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: null,
      categoryId: "",
      subcategoryId: null,
      isActive: true,
      isFeatured: false,
      availableExtras: [],
      stock: null,
      sku: null,
    },
  })

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories(tenantId, branchId)
        setCategories(data)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      }
    }

    if (branchId) {
      loadCategories()
    }
  }, [tenantId, branchId, toast])

  // Cargar extras
  useEffect(() => {
    const loadExtras = async () => {
      try {
        const data = await getProductExtras(tenantId, branchId)
        setExtras(data)
      } catch (error) {
        console.error("Error al cargar extras:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los extras",
          variant: "destructive",
        })
      }
    }

    if (branchId) {
      loadExtras()
    }
  }, [tenantId, branchId, toast])

  // Cargar producto si estamos editando
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return

      try {
        setLoading(true)
        const product = await getProduct(tenantId, branchId, productId)

        if (!product) {
          toast({
            title: "Error",
            description: "Producto no encontrado",
            variant: "destructive",
          })
          router.push(`/admin/products`)
          return
        }

        // Cargar subcategorías si hay una categoría seleccionada
        if (product.categoryId) {
          setSelectedCategory(product.categoryId)
          const category = await getCategory(tenantId, branchId, product.categoryId)
          if (category && category.subcategories) {
            setSubcategories(category.subcategories as Subcategory[])
          }
        }

        // Establecer valores del formulario
        form.reset({
          name: product.name,
          description: product.description || "",
          price: product.price,
          discountPrice: product.discountPrice || null,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId || null,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          availableExtras: product.availableExtras || [],
          stock: product.stock || null,
          sku: product.sku || null,
        })

        // Establecer vista previa de imagen
        if (product.imageUrl) {
          setImagePreview(product.imageUrl)
        }
      } catch (error) {
        console.error("Error al cargar producto:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (productId && branchId) {
      loadProduct()
    }
  }, [productId, tenantId, branchId, router, toast, form])

  // Manejar cambio de categoría para cargar subcategorías
  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    form.setValue("subcategoryId", null)

    if (!categoryId) {
      setSubcategories([])
      return
    }

    try {
      const category = await getCategory(tenantId, branchId, categoryId)
      if (category && category.subcategories) {
        setSubcategories(category.subcategories as Subcategory[])
      } else {
        setSubcategories([])
      }
    } catch (error) {
      console.error("Error al cargar subcategorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías",
        variant: "destructive",
      })
      setSubcategories([])
    }
  }

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

    // Crear URL para vista previa
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Enviar formulario
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      // Preparar los datos para enviar a Firebase
      const productData = {
        ...data,
        // Convertir valores vacíos a null para evitar undefined
        description: data.description || null,
        discountPrice: data.discountPrice || null,
        subcategoryId: data.subcategoryId || null,
        availableExtras: data.availableExtras || [],
        stock: data.stock || null,
        sku: data.sku || null,
      }

      if (isEditing && productId) {
        // Actualizar producto existente
        await updateProduct(tenantId, branchId, productId, productData, imageFile || undefined)
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente",
        })
      } else {
        // Crear nuevo producto
        await createProduct(tenantId, branchId, productData, imageFile || undefined)
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado correctamente",
        })
      }

      // Redirigir a la lista de productos
      router.push(`/admin/products`)
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información básica</h3>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del producto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del producto"
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio con descuento (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : Number.parseFloat(e.target.value)
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : e.target.value
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorización e imagen */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Categorización e imagen</h3>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleCategoryChange(value)
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría (opcional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value || null)}
                        defaultValue={field.value || ""}
                        value={field.value || ""}
                        disabled={!selectedCategory || subcategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Ninguna</SelectItem>
                          {subcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {!selectedCategory
                          ? "Selecciona primero una categoría"
                          : subcategories.length === 0
                            ? "No hay subcategorías disponibles"
                            : ""}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Imagen del producto (opcional)</FormLabel>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Vista previa"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-md bg-muted flex items-center justify-center border">
                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                      <p className="text-xs text-muted-foreground mt-1">Formatos recomendados: JPG, PNG. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extras y configuración */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Extras y configuración</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Producto activo</FormLabel>
                          <FormDescription>El producto estará visible y disponible para compra</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Producto destacado</FormLabel>
                          <FormDescription>El producto aparecerá en secciones destacadas</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="availableExtras"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Extras disponibles</FormLabel>
                          <FormDescription>Selecciona los extras que se pueden agregar a este producto</FormDescription>
                        </div>
                        {extras.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No hay extras disponibles. Crea extras en la sección de Extras Globales.
                          </p>
                        ) : (
                          <ExtrasSelector
                            extras={extras}
                            selectedExtras={form.watch("availableExtras") || []}
                            onSelectionChange={(selectedIds) => form.setValue("availableExtras", selectedIds)}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/products`)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Actualizar producto" : "Crear producto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
