"use client"

import { useState } from "react"
import { useCart } from "@/components/cart/cart-context"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ref, push } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { ShoppingBag, Home, Truck, CreditCard, Wallet, Banknote } from "lucide-react"

type DeliveryMethod = "pickup" | "takeaway" | "delivery"
type PaymentMethod = "cash" | "card" | "transfer"

// Valores predeterminados para evitar errores durante el pre-renderizado
const defaultServiceOptions = {
  offersPickup: true,
  offersTakeaway: true,
  offersDelivery: true,
  deliveryFee: 5.0,
}

const defaultPaymentMethods = {
  acceptsCash: true,
  acceptsCard: true,
  acceptsTransfer: true,
  onlinePaymentInstructions: "",
}

export default function CheckoutPage() {
  const {
    items = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    clearCart = () => {},
    isStoreOpen = true,
    serviceOptions = defaultServiceOptions,
    paymentMethods = defaultPaymentMethods,
  } = useCart()

  const router = useRouter()
  const params = useParams()
  const tenantId =
    typeof params?.tenant === "string" ? params.tenant : Array.isArray(params?.tenant) ? params.tenant[0] : ""
  const { toast } = useToast()

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [needsChange, setNeedsChange] = useState(false)
  const [changeAmount, setChangeAmount] = useState("")
  const [loading, setLoading] = useState(false)

  // Información del cliente
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [notes, setNotes] = useState("")

  // Calcular costo de envío
  const deliveryFee = deliveryMethod === "delivery" ? serviceOptions.deliveryFee : 0

  // Calcular total con envío
  const grandTotal = total + deliveryFee

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const handleSubmitOrder = async () => {
    if (!tenantId) {
      toast({
        title: "Error en el pedido",
        description: "No se pudo identificar el restaurante. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
      return
    }

    if (!isStoreOpen) {
      toast({
        title: "Restaurante cerrado",
        description: "Lo sentimos, el restaurante está cerrado en este momento.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en tu carrito.",
        variant: "destructive",
      })
      return
    }

    // Validar información según el método de entrega
    if (deliveryMethod === "delivery") {
      if (!name || !phone || !address) {
        toast({
          title: "Información incompleta",
          description: "Por favor completa todos los campos requeridos para la entrega a domicilio.",
          variant: "destructive",
        })
        return
      }
    } else if (deliveryMethod === "pickup" || deliveryMethod === "takeaway") {
      if (!name || !phone) {
        toast({
          title: "Información incompleta",
          description: "Por favor proporciona tu nombre y teléfono para contactarte.",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setLoading(true)

      // Crear el objeto de pedido
      const orderItems = items.map((item) => ({
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: 0,
        notes: item.notes || "",
        extras: item.extras.map((extra) => ({
          extraId: extra.extraId,
          name: extra.name,
          price: extra.price,
          quantity: extra.quantity,
        })),
        status: "pending",
      }))

      const orderData = {
        tenantId,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        type: deliveryMethod === "pickup" ? "dine-in" : deliveryMethod === "takeaway" ? "takeaway" : "delivery",
        status: "pending",
        items: orderItems,
        subtotal,
        tax,
        discount: 0,
        tip: 0,
        deliveryFee: deliveryMethod === "delivery" ? deliveryFee : 0,
        total: grandTotal,
        paymentStatus: "pending",
        paymentMethod,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,
        customerAddress: deliveryMethod === "delivery" ? address : null,
        notes: notes || null,
        needsChange: paymentMethod === "cash" && needsChange ? true : false,
        changeAmount: paymentMethod === "cash" && needsChange ? Number.parseFloat(changeAmount) || 0 : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Guardar el pedido en Firebase
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const newOrderRef = await push(ordersRef, orderData)

      // Limpiar el carrito
      clearCart()

      // Mostrar mensaje de éxito
      toast({
        title: "¡Pedido realizado con éxito!",
        description: `Tu número de pedido es: ${orderData.orderNumber}`,
      })

      // Redirigir a la página de confirmación
      router.push(`/order-confirmation/${newOrderRef.key}`)
    } catch (error) {
      console.error("Error al crear el pedido:", error)
      toast({
        title: "Error al procesar el pedido",
        description: "Ha ocurrido un error al procesar tu pedido. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isStoreOpen) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-4xl mb-4">🕒</div>
            <h2 className="text-xl font-semibold mb-2">Restaurante Cerrado</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Lo sentimos, el restaurante está cerrado en este momento.
              <br />
              Por favor, vuelve más tarde.
            </p>
            <Button onClick={() => router.push("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Método de entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
                className="space-y-4"
              >
                {serviceOptions.offersPickup && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Recoger en el Local
                    </Label>
                  </div>
                )}

                {serviceOptions.offersTakeaway && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="takeaway" id="takeaway" />
                    <Label htmlFor="takeaway" className="flex items-center cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      Para Llevar
                    </Label>
                  </div>
                )}

                {serviceOptions.offersDelivery && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex items-center cursor-pointer">
                      <Truck className="mr-2 h-4 w-4" />
                      Entrega a Domicilio
                      {deliveryMethod === "delivery" && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          (+{formatCurrency(serviceOptions.deliveryFee)})
                        </span>
                      )}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico (opcional)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección de Entrega *</Label>
                    <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones especiales, alergias, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Método de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="space-y-4"
              >
                {paymentMethods.acceptsCash && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer">
                      <Banknote className="mr-2 h-4 w-4" />
                      Efectivo
                    </Label>
                  </div>
                )}

                {paymentMethods.acceptsCard && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Tarjeta de Crédito/Débito
                    </Label>
                  </div>
                )}

                {paymentMethods.acceptsTransfer && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center cursor-pointer">
                      <Wallet className="mr-2 h-4 w-4" />
                      Transferencia Bancaria
                    </Label>
                  </div>
                )}
              </RadioGroup>

              {paymentMethod === "cash" && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="needsChange"
                      checked={needsChange}
                      onChange={(e) => setNeedsChange(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="needsChange">Necesito cambio</Label>
                  </div>

                  {needsChange && (
                    <div className="space-y-2">
                      <Label htmlFor="changeAmount">¿De cuánto pagarás?</Label>
                      <Input
                        id="changeAmount"
                        type="number"
                        min={grandTotal}
                        step="0.01"
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                        placeholder={`Mínimo ${formatCurrency(grandTotal)}`}
                      />
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "transfer" && paymentMethods.onlinePaymentInstructions && (
                <div className="mt-4 pl-6 border-l-2 border-gray-200">
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium mb-1">Instrucciones para transferencia:</p>
                    <p>{paymentMethods.onlinePaymentInstructions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Lista de productos */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totales */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>

                  {deliveryMethod === "delivery" && (
                    <div className="flex justify-between">
                      <span>Costo de envío</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleSubmitOrder} disabled={loading}>
                {loading ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
