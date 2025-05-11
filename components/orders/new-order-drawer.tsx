"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderFormData, OrderType } from "@/lib/types/order"
import { createOrder, getAvailableTables } from "@/lib/services/order-service"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types/product"
import { getProducts } from "@/lib/services/product-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Minus, Plus, Trash2 } from "lucide-react"

interface NewOrderDrawerProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  branchId: string
  onOrderCreated: () => void
}

export function NewOrderDrawer({ isOpen, onClose, tenantId, branchId, onOrderCreated }: NewOrderDrawerProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    type: "dine_in",
    items: [],
    paymentMethod: "cash",
  })

  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [productQuantity, setProductQuantity] = useState(1)
  const [productNotes, setProductNotes] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsData, tablesData] = await Promise.all([
          getProducts(tenantId, branchId),
          getAvailableTables(tenantId, branchId),
        ])

        setProducts(productsData)
        setTables(tablesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos necesarios",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, tenantId, branchId])

  const handleTypeChange = (type: OrderType) => {
    setFormData((prev) => ({ ...prev, type }))
  }

  const handleAddProduct = () => {
    if (!selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id,
          productName: product.name,
          quantity: productQuantity,
          price: product.price,
          notes: productNotes || undefined,
        },
      ],
    }))

    // Reset product selection
    setSelectedProduct("")
    setProductQuantity(1)
    setProductNotes("")
  }

  const handleRemoveProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
    try {
      if (formData.items.length === 0) {
        toast({
          title: "Error",
          description: "Debes agregar al menos un producto",
          variant: "destructive",
        })
        return
      }

      if (formData.type === "dine_in" && !formData.tableNumber) {
        toast({
          title: "Error",
          description: "Debes seleccionar una mesa",
          variant: "destructive",
        })
        return
      }

      if (
        formData.type === "delivery" &&
        (!formData.customer?.name || !formData.customer?.phone || !formData.customer?.address)
      ) {
        toast({
          title: "Error",
          description: "Debes completar los datos del cliente para delivery",
          variant: "destructive",
        })
        return
      }

      if (formData.type === "takeaway" && (!formData.customer?.name || !formData.customer?.phone)) {
        toast({
          title: "Error",
          description: "Debes completar el nombre y teléfono del cliente para pedidos para llevar",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)
      await createOrder(tenantId, branchId, formData)

      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado exitosamente",
      })

      onOrderCreated()
      onClose()
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-[540px] md:w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuevo Pedido</SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Tabs defaultValue="order-type" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="order-type">Tipo de Pedido</TabsTrigger>
                <TabsTrigger value="products">Productos</TabsTrigger>
                <TabsTrigger value="customer">Cliente</TabsTrigger>
              </TabsList>

              <TabsContent value="order-type">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Pedido</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${formData.type === "dine_in" ? "border-primary ring-2 ring-primary/20" : ""}`}
                        onClick={() => handleTypeChange("dine_in")}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="rounded-full bg-primary/10 p-2 mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                              <path d="M7 2v20" />
                              <path d="M21 15V2" />
                              <path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                              <path d="M18 8v7" />
                            </svg>
                          </div>
                          <span className="font-medium">Mesa</span>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${formData.type === "takeaway" ? "border-primary ring-2 ring-primary/20" : ""}`}
                        onClick={() => handleTypeChange("takeaway")}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="rounded-full bg-primary/10 p-2 mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                              <path d="M3 6h18" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                          </div>
                          <span className="font-medium">Para llevar</span>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${formData.type === "delivery" ? "border-primary ring-2 ring-primary/20" : ""}`}
                        onClick={() => handleTypeChange("delivery")}
                      >
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          <div className="rounded-full bg-primary/10 p-2 mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M10 17h4V5H2v12h3" />
                              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                              <path d="M14 17h1" />
                              <circle cx="7.5" cy="17.5" r="2.5" />
                              <circle cx="17.5" cy="17.5" r="2.5" />
                            </svg>
                          </div>
                          <span className="font-medium">Delivery</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {formData.type === "dine_in" && (
                    <div className="space-y-2">
                      <Label htmlFor="tableNumber">Número de Mesa</Label>
                      <Select
                        value={formData.tableNumber}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, tableNumber: value }))}
                      >
                        <SelectTrigger id="tableNumber">
                          <SelectValue placeholder="Selecciona una mesa" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables.map((table) => (
                            <SelectItem key={table} value={table}>
                              Mesa {table}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pago</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Selecciona método de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas del Pedido</Label>
                    <Textarea
                      id="notes"
                      placeholder="Instrucciones especiales para el pedido"
                      value={formData.notes || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-2 items-end">
                    <div>
                      <Label htmlFor="product">Producto</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quantity">Cantidad</Label>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setProductQuantity((prev) => Math.max(1, prev - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          className="mx-2 text-center"
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(Number.parseInt(e.target.value) || 1)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setProductQuantity((prev) => prev + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button type="button" onClick={handleAddProduct} disabled={!selectedProduct}>
                      Agregar
                    </Button>
                  </div>

                  <div>
                    <Label htmlFor="productNotes">Notas del Producto</Label>
                    <Textarea
                      id="productNotes"
                      placeholder="Instrucciones especiales para este producto"
                      value={productNotes}
                      onChange={(e) => setProductNotes(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md">
                    <div className="p-3 border-b bg-muted/50 font-medium">Productos en el Pedido</div>
                    {formData.items.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No hay productos agregados</div>
                    ) : (
                      <div className="divide-y">
                        {formData.items.map((item, index) => (
                          <div key={index} className="p-3 flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {item.quantity}x {item.productName}
                              </div>
                              {item.notes && <div className="text-sm text-muted-foreground">Nota: {item.notes}</div>}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="p-3 flex justify-between items-center font-bold">
                          <div>Total</div>
                          <div>${calculateTotal().toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="customer">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre del Cliente</Label>
                    <Input
                      id="customerName"
                      placeholder="Nombre completo"
                      value={formData.customer?.name || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, name: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Teléfono</Label>
                    <Input
                      id="customerPhone"
                      placeholder="Número de teléfono"
                      value={formData.customer?.phone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, phone: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (opcional)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="Correo electrónico"
                      value={formData.customer?.email || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customer: { ...prev.customer, email: e.target.value },
                        }))
                      }
                    />
                  </div>

                  {formData.type === "delivery" && (
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Dirección de Entrega</Label>
                      <Textarea
                        id="customerAddress"
                        placeholder="Dirección completa para entrega"
                        value={formData.customer?.address || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customer: { ...prev.customer, address: e.target.value },
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <SheetFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Pedido"
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
