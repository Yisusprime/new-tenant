"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OrderFormData, OrderItem, OrderType } from "@/lib/types/order"
import { createOrder } from "@/lib/services/order-service"
import { getProducts } from "@/lib/services/product-service"
import { getProductExtras } from "@/lib/services/product-service"
import type { Product, ProductExtra } from "@/lib/types/product"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { ProductSelector } from "./product-selector"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onOrderCreated: () => void
}

export function CreateOrderDialog({ open, onOpenChange, tenantId, branchId, onOrderCreated }: CreateOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [orderType, setOrderType] = useState<OrderType>("local")
  const [items, setItems] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [deliveryStreet, setDeliveryStreet] = useState("")
  const [deliveryNumber, setDeliveryNumber] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [deliveryZipCode, setDeliveryZipCode] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [productSelectorOpen, setProductSelectorOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadProducts()
      loadExtras()
    }
  }, [open, tenantId, branchId])

  const loadProducts = async () => {
    try {
      const productsData = await getProducts(tenantId, branchId)
      setProducts(productsData.filter((p) => p.isActive))
    } catch (error) {
      console.error("Error al cargar productos:", error)
    }
  }

  const loadExtras = async () => {
    try {
      const extrasData = await getProductExtras(tenantId, branchId)
      setExtras(extrasData.filter((e) => e.isActive))
    } catch (error) {
      console.error("Error al cargar extras:", error)
    }
  }

  const handleAddProduct = (product: Product, quantity = 1, selectedExtras: ProductExtra[] = []) => {
    const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0)
    const itemSubtotal = (product.price + extrasTotal) * quantity

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      extras: selectedExtras.map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: extra.price,
      })),
      subtotal: itemSubtotal,
    }

    setItems([...items, newItem])
    setProductSelectorOpen(false)
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const extrasTotal = item.extras ? item.extras.reduce((sum, extra) => sum + extra.price, 0) : 0
          return {
            ...item,
            quantity,
            subtotal: (item.price + extrasTotal) * quantity,
          }
        }
        return item
      }),
    )
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert("Debe agregar al menos un producto al pedido")
      return
    }

    try {
      setLoading(true)

      const orderData: OrderFormData = {
        type: orderType,
        items,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        paymentMethod: paymentMethod || undefined,
      }

      if (orderType === "table") {
        orderData.tableNumber = tableNumber
      } else if (orderType === "delivery") {
        orderData.deliveryAddress = {
          street: deliveryStreet,
          number: deliveryNumber,
          city: deliveryCity,
          zipCode: deliveryZipCode || undefined,
          notes: deliveryNotes || undefined,
        }
      }

      await createOrder(tenantId, branchId, orderData)
      resetForm()
      onOrderCreated()
    } catch (error) {
      console.error("Error al crear pedido:", error)
      alert("Error al crear el pedido. Inténtelo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setOrderType("local")
    setItems([])
    setCustomerName("")
    setCustomerPhone("")
    setCustomerEmail("")
    setTableNumber("")
    setDeliveryStreet("")
    setDeliveryNumber("")
    setDeliveryCity("")
    setDeliveryZipCode("")
    setDeliveryNotes("")
    setPaymentMethod("")
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) resetForm()
          onOpenChange(newOpen)
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
            <DialogDescription>Completa la información para crear un nuevo pedido.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="items" className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="items">Artículos</TabsTrigger>
              <TabsTrigger value="type">Tipo de Pedido</TabsTrigger>
              <TabsTrigger value="customer">Cliente</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Artículos del Pedido</h3>
                  <Button onClick={() => setProductSelectorOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-gray-500">No hay artículos en el pedido</p>
                    <Button onClick={() => setProductSelectorOpen(true)} variant="link">
                      Agregar Producto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start border p-4 rounded-md">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{item.name}</p>
                            <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                          </div>
                          <div className="flex items-center mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <span className="ml-4 text-sm text-gray-500">{formatCurrency(item.price)} c/u</span>
                          </div>
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              <p>Extras:</p>
                              <ul className="list-disc list-inside ml-2">
                                {item.extras.map((extra, i) => (
                                  <li key={i}>
                                    {extra.name} ({formatCurrency(extra.price)})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="type" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Tipo de Pedido</Label>
                  <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
                    <SelectTrigger id="orderType">
                      <SelectValue placeholder="Seleccionar tipo de pedido" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Consumo en Local</SelectItem>
                      <SelectItem value="takeaway">Para Llevar</SelectItem>
                      <SelectItem value="table">Mesa</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orderType === "table" && (
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Número de Mesa</Label>
                    <Input
                      id="tableNumber"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ej: 5"
                    />
                  </div>
                )}

                {orderType === "delivery" && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Dirección de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryStreet">Calle</Label>
                        <Input
                          id="deliveryStreet"
                          value={deliveryStreet}
                          onChange={(e) => setDeliveryStreet(e.target.value)}
                          placeholder="Ej: Av. Principal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryNumber">Número</Label>
                        <Input
                          id="deliveryNumber"
                          value={deliveryNumber}
                          onChange={(e) => setDeliveryNumber(e.target.value)}
                          placeholder="Ej: 123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryCity">Ciudad</Label>
                        <Input
                          id="deliveryCity"
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="Ej: Buenos Aires"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryZipCode">Código Postal</Label>
                        <Input
                          id="deliveryZipCode"
                          value={deliveryZipCode}
                          onChange={(e) => setDeliveryZipCode(e.target.value)}
                          placeholder="Ej: 1000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryNotes">Notas de Entrega</Label>
                      <Textarea
                        id="deliveryNotes"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Ej: Timbre 2B, edificio azul"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="app">App de Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre del Cliente</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: +54 11 1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Ej: cliente@ejemplo.com"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        products={products}
        extras={extras}
        onAddProduct={handleAddProduct}
      />
    </>
  )
}
