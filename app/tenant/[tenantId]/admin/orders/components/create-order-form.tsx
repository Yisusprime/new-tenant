"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Order, OrderType, OrderStatus, PaymentStatus, PaymentMethod, TableInfo } from "@/lib/types/order"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { ProductService } from "@/lib/services/product-service"
import { useBranch } from "@/lib/context/branch-context"
import { formatCurrency } from "@/lib/utils"

// Esquema de validación para el formulario
const orderFormSchema = z.object({
  type: z.enum(["dine_in", "takeaway", "table", "delivery"]),
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  tableId: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "transfer", "other"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded"]),
  notes: z.string().optional(),
  // Campos para delivery
  street: z.string().optional(),
  number: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  instructions: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

interface CreateOrderFormProps {
  isOpen: boolean
  onClose: () => void
  onCreateOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => Promise<string>
  availableTables: TableInfo[]
  tenantId: string
  branchId: string
}

export function CreateOrderForm({
  isOpen,
  onClose,
  onCreateOrder,
  availableTables,
  tenantId,
  branchId,
}: CreateOrderFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { currentBranch } = useBranch()

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      type: "dine_in",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      paymentStatus: "pending",
      notes: "",
    },
  })

  const orderType = form.watch("type")

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      if (!tenantId || !branchId) return

      try {
        const productService = new ProductService(tenantId, branchId)
        const fetchedProducts = await productService.getProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos.",
          variant: "destructive",
        })
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen, tenantId, branchId, toast])

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Agregar producto al pedido
  const addProductToOrder = (product: any) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id)

    if (existingProduct) {
      // Incrementar cantidad si ya existe
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1, subtotal: (p.quantity + 1) * p.price } : p,
        ),
      )
    } else {
      // Agregar nuevo producto
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price,
          extras: [],
        },
      ])
    }
  }

  // Eliminar producto del pedido
  const removeProductFromOrder = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  // Actualizar cantidad de un producto
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    setSelectedProducts(
      selectedProducts.map((p) => (p.id === productId ? { ...p, quantity, subtotal: quantity * p.price } : p)),
    )
  }

  // Calcular totales
  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, product) => sum + product.subtotal, 0)
    const tax = subtotal * 0.1 // 10% de impuesto (ejemplo)
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  const onSubmit = async (data: OrderFormValues) => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un producto al pedido.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Preparar datos del pedido
      const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
        tenantId,
        branchId,
        orderNumber: "", // Se generará en el servicio
        type: data.type as OrderType,
        status: "pending" as OrderStatus,
        items: selectedProducts,
        subtotal,
        tax,
        total,
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail,
        },
        paymentStatus: data.paymentStatus as PaymentStatus,
        paymentMethod: data.paymentMethod as PaymentMethod,
        notes: data.notes,
      }

      // Agregar información de mesa si es necesario
      if (data.type === "table" && data.tableId) {
        const selectedTable = availableTables.find((table) => table.id === data.tableId)
        if (selectedTable) {
          orderData.tableInfo = selectedTable
        }
      }

      // Agregar dirección si es delivery
      if (data.type === "delivery") {
        orderData.customer.address = {
          street: data.street || "",
          number: data.number,
          apartment: data.apartment,
          city: data.city || "",
          state: data.state,
          zipCode: data.zipCode,
          instructions: data.instructions,
        }

        // Agregar costo de envío para delivery
        orderData.deliveryFee = 5.0 // Valor de ejemplo, podría ser calculado según distancia
      }

      // Crear el pedido
      const orderId = await onCreateOrder(orderData)

      toast({
        title: "Pedido creado",
        description: `El pedido #${orderData.orderNumber} ha sido creado exitosamente.`,
      })

      onClose()

      // Opcional: redirigir a la página de detalles del pedido
      // router.push(`/tenant/${tenantId}/admin/orders/${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          <DialogDescription>Completa el formulario para crear un nuevo pedido.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda: Productos */}
          <div>
            <h3 className="font-semibold mb-2">Productos</h3>
            <div className="mb-4">
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="h-[300px] overflow-y-auto border rounded-md p-2">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No se encontraron productos</p>
              ) : (
                <ul className="space-y-2">
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between items-center p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => addProductToOrder(product)}
                    >
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                      <div className="font-medium">{formatCurrency(product.price)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Productos seleccionados</h3>
              {selectedProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 border rounded-md">
                  No hay productos seleccionados
                </p>
              ) : (
                <div className="border rounded-md p-2">
                  <ul className="space-y-2">
                    {selectedProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm">{formatCurrency(product.price)} c/u</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateProductQuantity(product.id, product.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{product.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateProductQuantity(product.id, product.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeProductFromOrder(product.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Impuestos (10%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    {orderType === "delivery" && (
                      <div className="flex justify-between text-sm">
                        <span>Costo de envío:</span>
                        <span>{formatCurrency(5.0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold pt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(total + (orderType === "delivery" ? 5.0 : 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Formulario */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pedido</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo de pedido" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dine_in">Para comer en el local</SelectItem>
                          <SelectItem value="takeaway">Para llevar</SelectItem>
                          <SelectItem value="table">Mesa</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {orderType === "table" && (
                  <FormField
                    control={form.control}
                    name="tableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar mesa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTables.length === 0 ? (
                              <SelectItem value="" disabled>
                                No hay mesas disponibles
                              </SelectItem>
                            ) : (
                              availableTables.map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  {table.name} (Cap: {table.capacity})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Teléfono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {orderType === "delivery" && (
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="font-semibold">Dirección de Entrega</h3>

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Calle</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Número" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apto/Oficina</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto/Oficina" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ciudad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado/Provincia</FormLabel>
                            <FormControl>
                              <Input placeholder="Estado/Provincia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal</FormLabel>
                          <FormControl>
                            <Input placeholder="Código Postal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrucciones de entrega</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Instrucciones para el repartidor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="transfer">Transferencia</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de Pago</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas adicionales</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas o instrucciones especiales" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading || selectedProducts.length === 0}>
                    {loading ? "Creando..." : "Crear Pedido"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
