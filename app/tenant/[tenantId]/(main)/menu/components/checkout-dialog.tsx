"use client"

import { useState } from "react"
import { useCart } from "../context/cart-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createOrder } from "@/lib/services/order-service"
import { toast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Loader2, CreditCard, Banknote, Smartphone, MapPin, User, Phone, Mail } from "lucide-react"
import type { OrderFormData, OrderType, DeliveryAddress } from "@/lib/types/order"
import Image from "next/image"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  restaurantConfig?: any
}

export function CheckoutDialog({ open, onOpenChange, tenantId, branchId, restaurantConfig }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Datos del pedido
  const [orderType, setOrderType] = useState<OrderType>("takeaway")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: "",
    number: "",
    city: "",
    zipCode: "",
    notes: "",
  })

  // Calcular totales
  const subtotal = totalPrice
  const taxRate = restaurantConfig?.basicInfo?.taxRate || 0.19
  const taxIncluded = restaurantConfig?.basicInfo?.taxIncluded !== false
  const taxEnabled = restaurantConfig?.basicInfo?.taxEnabled !== false

  let tax = 0
  if (taxEnabled && !taxIncluded) {
    tax = Math.round(subtotal * taxRate)
  }

  const total = subtotal + tax

  const handleSubmitOrder = async () => {
    try {
      setLoading(true)

      // Validaciones básicas
      if (!customerName.trim()) {
        toast({
          title: "Error",
          description: "El nombre del cliente es requerido",
          variant: "destructive",
        })
        return
      }

      if (!customerPhone.trim()) {
        toast({
          title: "Error",
          description: "El teléfono del cliente es requerido",
          variant: "destructive",
        })
        return
      }

      if (!paymentMethod) {
        toast({
          title: "Error",
          description: "Selecciona un método de pago",
          variant: "destructive",
        })
        return
      }

      // Validar dirección para delivery
      if (orderType === "delivery") {
        if (!deliveryAddress.street.trim() || !deliveryAddress.number.trim() || !deliveryAddress.city.trim()) {
          toast({
            title: "Error",
            description: "Completa todos los campos de la dirección de entrega",
            variant: "destructive",
          })
          return
        }
      }

      // Convertir items del carrito al formato de OrderItem
      const orderItems = items.map((item) => ({
        id: item.id,
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        subtotal: item.price * (item.quantity || 1),
      }))

      // Preparar datos del pedido
      const orderData: OrderFormData = {
        type: orderType,
        items: orderItems,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod,
        subtotal,
        tax,
        total,
        taxIncluded,
        taxEnabled,
      }

      // Agregar dirección de entrega si es delivery
      if (orderType === "delivery") {
        orderData.deliveryAddress = deliveryAddress
      }

      // Crear el pedido
      const newOrder = await createOrder(tenantId, branchId, orderData)

      // Limpiar carrito y cerrar modal
      clearCart()
      onOpenChange(false)

      // Resetear formulario
      setCurrentStep(1)
      setCustomerName("")
      setCustomerPhone("")
      setCustomerEmail("")
      setPaymentMethod("")
      setDeliveryAddress({
        street: "",
        number: "",
        city: "",
        zipCode: "",
        notes: "",
      })

      toast({
        title: "¡Pedido creado exitosamente!",
        description: `Tu pedido ${newOrder.orderNumber} ha sido enviado al restaurante`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error al crear pedido:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      if (!orderType) {
        toast({
          title: "Error",
          description: "Selecciona el tipo de pedido",
          variant: "destructive",
        })
        return
      }
    }

    if (currentStep === 2) {
      if (!customerName.trim() || !customerPhone.trim()) {
        toast({
          title: "Error",
          description: "Completa los datos del cliente",
          variant: "destructive",
        })
        return
      }

      if (
        orderType === "delivery" &&
        (!deliveryAddress.street.trim() || !deliveryAddress.number.trim() || !deliveryAddress.city.trim())
      ) {
        toast({
          title: "Error",
          description: "Completa la dirección de entrega",
          variant: "destructive",
        })
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicador de pasos */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? "bg-primary text-primary-foreground" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && <div className={`w-8 h-0.5 ${step < currentStep ? "bg-primary" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Paso 1: Tipo de pedido */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tipo de pedido</h3>
              <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="flex-1 cursor-pointer">
                    <div className="font-medium">Para llevar</div>
                    <div className="text-sm text-gray-600">Recoger en el restaurante</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm text-gray-600">Entrega a domicilio</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local" className="flex-1 cursor-pointer">
                    <div className="font-medium">Consumir en local</div>
                    <div className="text-sm text-gray-600">Comer en el restaurante</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Paso 2: Datos del cliente */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos del cliente</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    <User className="h-4 w-4 inline mr-1" />
                    Nombre completo *
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Teléfono *
                  </Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ingresa tu teléfono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email (opcional)
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Ingresa tu email"
                />
              </div>

              {/* Dirección de entrega para delivery */}
              {orderType === "delivery" && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Dirección de entrega
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="street">Calle *</Label>
                      <Input
                        id="street"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        placeholder="Nombre de la calle"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={deliveryAddress.number}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, number: e.target.value })}
                        placeholder="Número"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        placeholder="Ciudad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Código postal</Label>
                      <Input
                        id="zipCode"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                        placeholder="Código postal"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      id="notes"
                      value={deliveryAddress.notes}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, notes: e.target.value })}
                      placeholder="Instrucciones especiales para la entrega"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Resumen y pago */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Resumen del pedido</h3>

              {/* Resumen de productos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Productos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">{formatCurrency(item.price * (item.quantity || 1))}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Información del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Información del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge variant="outline">
                      {orderType === "takeaway"
                        ? "Para llevar"
                        : orderType === "delivery"
                          ? "Delivery"
                          : "Consumir en local"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliente:</span>
                    <span className="text-sm">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <span className="text-sm">{customerPhone}</span>
                  </div>
                  {customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm">{customerEmail}</span>
                    </div>
                  )}
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dirección:</span>
                      <span className="text-sm text-right">
                        {deliveryAddress.street} {deliveryAddress.number}, {deliveryAddress.city}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Método de pago */}
              <div className="space-y-3">
                <Label>Método de pago</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center cursor-pointer">
                      <Banknote className="h-4 w-4 mr-2" />
                      Efectivo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Tarjeta
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer" className="flex items-center cursor-pointer">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Transferencia
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Totales */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {taxEnabled && !taxIncluded && (
                      <div className="flex justify-between">
                        <span>IVA ({Math.round(taxRate * 100)}%):</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    {taxEnabled && taxIncluded && <p className="text-xs text-gray-600 text-right">IVA incluido</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button onClick={nextStep}>Siguiente</Button>
            ) : (
              <Button onClick={handleSubmitOrder} disabled={loading || !paymentMethod} className="min-w-[120px]">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Confirmar Pedido"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
