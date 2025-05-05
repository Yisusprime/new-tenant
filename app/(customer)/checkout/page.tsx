"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useCart } from "@/components/cart/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CreditCard, Truck, Store, Home, Check } from "lucide-react"
import Link from "next/link"
import { ref, push, set } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"

export default function CheckoutPage() {
  const { items, subtotal, tax, total, clearCart } = useCart()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [orderType, setOrderType] = useState("delivery")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [orderNotes, setOrderNotes] = useState("")

  const tenantId =
    typeof params?.tenant === "string" ? params.tenant : Array.isArray(params?.tenant) ? params.tenant[0] : ""

  useEffect(() => {
    if (items.length === 0) {
      router.push("/")
    }
  }, [items, router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!customerName || !customerPhone) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa tu nombre y teléfono",
        variant: "destructive",
      })
      return
    }

    if (orderType === "delivery" && !customerAddress) {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingresa tu dirección de entrega",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Preparar los datos del pedido
      const orderData = {
        tenantId,
        type: orderType,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          extras: item.extras,
          notes: item.notes || "",
        })),
        customerName,
        customerPhone,
        customerEmail,
        status: "pending",
        paymentMethod,
        paymentStatus: "pending",
        subtotal,
        tax,
        total,
        createdAt: Date.now(),
        source: "menu", // Identificar que viene del menú
      }

      if (orderType === "delivery") {
        orderData.customerAddress = customerAddress
        orderData.deliveryNotes = deliveryNotes
      }

      if (orderNotes) {
        orderData.notes = orderNotes
      }

      // CORREGIDO: Ruta correcta para las órdenes
      const ordersRef = ref(rtdb, `${tenantId}/orders`)
      console.log("Creating order at path:", ordersRef.toString())

      const newOrderRef = push(ordersRef)
      await set(newOrderRef, orderData)

      const orderId = newOrderRef.key

      // Limpiar el carrito
      clearCart()

      // Redirigir a la página de confirmación
      router.push(`/order-confirmation/${orderId}`)
    } catch (error) {
      console.error("Error al crear el pedido:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Por favor intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return null // No renderizar nada si el carrito está vacío
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Link
          href="/cart"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al carrito
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Información de contacto</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="email">Correo electrónico (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Tipo de pedido</h2>
                <RadioGroup
                  value={orderType}
                  onValueChange={setOrderType}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                      orderType === "delivery" ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                    <Label htmlFor="delivery" className="flex items-center cursor-pointer flex-1">
                      <Truck className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Delivery</div>
                        <div className="text-xs text-muted-foreground">Entrega a domicilio</div>
                      </div>
                    </Label>
                    {orderType === "delivery" && <Check className="h-4 w-4 text-primary" />}
                  </div>

                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                      orderType === "pickup" ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                    <Label htmlFor="pickup" className="flex items-center cursor-pointer flex-1">
                      <Store className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-xs text-muted-foreground">Recoger en tienda</div>
                      </div>
                    </Label>
                    {orderType === "pickup" && <Check className="h-4 w-4 text-primary" />}
                  </div>

                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                      orderType === "dine-in" ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="dine-in" id="dine-in" className="sr-only" />
                    <Label htmlFor="dine-in" className="flex items-center cursor-pointer flex-1">
                      <Home className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Comer aquí</div>
                        <div className="text-xs text-muted-foreground">En el restaurante</div>
                      </div>
                    </Label>
                    {orderType === "dine-in" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </RadioGroup>
              </div>

              {orderType === "delivery" && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Información de entrega</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección de entrega *</Label>
                      <Input
                        id="address"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-notes">Instrucciones de entrega (opcional)</Label>
                      <Textarea
                        id="delivery-notes"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Ej: Timbre no funciona, llamar por teléfono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h2 className="text-lg font-medium mb-4">Método de pago</h2>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="cash" id="cash" className="sr-only" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                      <div>
                        <div className="font-medium">Efectivo</div>
                        <div className="text-xs text-muted-foreground">Pago al recibir</div>
                      </div>
                    </Label>
                    {paymentMethod === "cash" && <Check className="h-4 w-4 text-primary" />}
                  </div>

                  <div
                    className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${
                      paymentMethod === "card" ? "border-primary bg-primary/5" : "border-input"
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" className="sr-only" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                      <CreditCard className="mr-2 h-5 w-5" />
                      <div>
                        <div className="font-medium">Tarjeta</div>
                        <div className="text-xs text-muted-foreground">Pago con tarjeta al recibir</div>
                      </div>
                    </Label>
                    {paymentMethod === "card" && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="order-notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: Sin cebolla, alergias, etc."
                />
              </div>
            </div>

            <div className="mt-8">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Procesando..." : "Confirmar pedido"}
              </Button>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-lg font-medium mb-4">Resumen del pedido</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                    {item.extras.length > 0 && (
                      <div className="text-xs text-muted-foreground ml-5">
                        {item.extras.map((extra) => (
                          <div key={extra.id}>
                            {extra.quantity}x {extra.name} (+${extra.price.toFixed(2)})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="font-medium">
                    $
                    {(
                      item.price * item.quantity +
                      item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0) * item.quantity
                    ).toFixed(2)}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
