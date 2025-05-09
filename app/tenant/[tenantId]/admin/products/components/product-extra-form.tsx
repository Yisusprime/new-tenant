"use client"

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
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createProductExtra, updateProductExtra, getProductExtra } from "@/lib/services/product-service"

// Esquema de validación para el formulario
const extraSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

type ExtraFormValues = z.infer<typeof extraSchema>

interface ProductExtraFormProps {
  tenantId: string
  branchId: string
  extraId?: string
}

export function ProductExtraForm({ tenantId, branchId, extraId }: ProductExtraFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!extraId

  // Inicializar formulario
  const form = useForm<ExtraFormValues>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      isActive: true,
    },
  })

  // Cargar extra si estamos editando
  useEffect(() => {
    const loadExtra = async () => {
      if (!extraId) return

      try {
        setLoading(true)
        const extra = await getProductExtra(tenantId, branchId, extraId)

        if (!extra) {
          toast({
            title: "Error",
            description: "Extra no encontrado",
            variant: "destructive",
          })
          router.push(`/tenant/${tenantId}/admin/products`)
          return
        }

        // Establecer valores del formulario
        form.reset({
          name: extra.name,
          price: extra.price,
          description: extra.description || "",
          isActive: extra.isActive,
        })
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

    if (extraId && branchId) {
      loadExtra()
    }
  }, [extraId, tenantId, branchId, router, toast, form])

  // Enviar formulario
  const onSubmit = async (data: ExtraFormValues) => {
    try {
      setLoading(true)

      if (isEditing && extraId) {
        // Actualizar extra existente
        await updateProductExtra(tenantId, branchId, extraId, data)
        toast({
          title: "Extra actualizado",
          description: "El extra ha sido actualizado correctamente",
        })
      } else {
        // Crear nuevo extra
        await createProductExtra(tenantId, branchId, data)
        toast({
          title: "Extra creado",
          description: "El extra ha sido creado correctamente",
        })
      }

      // Redirigir a la lista de productos
      router.push(`/tenant/${tenantId}/admin/products`)
    } catch (error) {
      console.error("Error al guardar extra:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el extra",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del extra</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del extra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción del extra"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Extra activo</FormLabel>
                      <FormDescription>El extra estará disponible para ser agregado a productos</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/tenant/${tenantId}/admin/products`)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Actualizar extra" : "Crear extra"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
