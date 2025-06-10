"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { createOrder } from "@/lib/services/order-service"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { ArrowLeft, ArrowRight, CreditCard, DollarSign } from "lucide-react"
import type { OrderFormData } from "@/lib/types/order"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
}

type Step = "order-type" | "customer-info" | "payment" | "summary"

export function CheckoutDialog({ open, onOpenChange, tenantId, branchId }: CheckoutDialogProps) {
  const { items, getTotalPrice, clearCart } = useCart()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<Step>("order-type")
  const [loading, setLoading] = useState(false)
  const [restaurantConfig, setRestaurantConfig] = useState<any>(null)

  // Form data
  const [orderType, setOrderType] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [needsChange, setNeedsChange] = useState(false)
  const [cashAmount, setCashAmount] = useState("")
  const [notes, setNotes] = useState("")

  const totalPrice = getTotalPrice()
  const changeAmount = needsChange && cashAmount ? Number.parseFloat(cashAmount) - totalPrice : 0

  // Cargar configuración del restaurante
  useEffect(() => {
    if (open && tenantId && branchId) {
      loadRestaurantConfig()
    }
  }, [open, tenantId, branchId])

  const loadRestaurantConfig = async () => {
    try {
      const config = await getRestaurantConfig(tenantId, branchId)
      setRestaurantConfig(config)
    } catch (error) {
      console.error("Error loading restaurant config:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del restaurante",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setCurrentStep("order-type")
    setOrderType("")
    setCustomerName("")
    setCustomerPhone("")
    setDeliveryAddress("")
    setPaymentMethod("")
    setNeedsChange(false)
    setCashAmount("")
    setNotes("")
  }

  const handleNext = () => {
    switch (currentStep) {
      case "order-type":
        setCurrentStep("customer-info")
        break
      case "customer-info":
        setCurrentStep("payment")
        break
      case "payment":
        setCurrentStep("summary")
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case "customer-info":
        setCurrentStep("order-type")
        break
      case "payment":
        setCurrentStep("customer-info")
        break
      case "summary":
        setCurrentStep("payment")
        break
    }
  }

  const sendToWhatsApp = (order: any) => {
    // Format the order details for WhatsApp
    let message = `*Nuevo Pedido ${order.orderNumber}*\n\n`

    // Customer info
    message += `*Cliente:* ${customerName}\n`
    message += `*Teléfono:* ${customerPhone}\n`

    // Order type
    const orderTypeLabel = getAvailableOrderTypes().find((t) => t.value === orderType)?.label || orderType
    message += `*Tipo de pedido:* ${orderTypeLabel}\n`

    // Delivery address if applicable
    if (orderType === "delivery" && deliveryAddress) {
      message += `*Dirección:* ${deliveryAddress}\n`
    }

    // Payment method
    const paymentMethodLabel =
      getAvailablePaymentMethods().find((m) => m.value === paymentMethod)?.label || paymentMethod
    message += `*Método de pago:* ${paymentMethodLabel}\n`

    // Cash payment details if applicable
    if (paymentMethod === "cash" && needsChange) {
      message += `*Paga con:* $${cashAmount} (Vuelto: $${changeAmount.toFixed(2)})\n`
    }

    // Items
    message += `\n*Productos:*\n`
    items.forEach((item) => {
      message += `- ${item.quantity}x ${item.name}: $${item.subtotal.toFixed(2)}\n`
    })

    // Total
    message += `\n*Total:* $${totalPrice.toFixed(2)}\n`

    // Notes if any
    if (notes) {
      message += `\n*Notas:* ${notes}\n`
    }

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message)

    // Get restaurant phone from config or use a default
    const restaurantPhone = restaurantConfig?.contactInfo?.phone || ""

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${restaurantPhone}?text=${encodedMessage}`

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank")
  }

  const handleSubmitOrder = async () => {
    if (!orderType || !customerName || !customerPhone || !paymentMethod) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "cash" && needsChange) {
      const amount = Number.parseFloat(cashAmount)
      if (!amount || amount < totalPrice) {
        toast({
          title: "Error",
          description: "El monto en efectivo debe ser mayor o igual al total",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)

    try {
      const orderData: OrderFormData = {
        type: orderType as any,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          extras: item.extras || [],
          notes: item.notes,
        })),
        customerName,
        customerPhone,
        // Email removed
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        paymentMethod,
        cashPayment:
          paymentMethod === "cash" && needsChange
            ? {
                needsChange,
                amountPaid: Number.parseFloat(cashAmount),
                changeAmount,
              }
            : undefined,
        notes: notes || undefined,
      }

      const newOrder = await createOrder(tenantId, branchId, orderData)

      toast({
        title: "¡Pedido creado!",
        description: "Tu pedido ha sido enviado al restaurante",
      })

      // Send to WhatsApp
      sendToWhatsApp(newOrder)

      clearCart()
      onOpenChange(false)
      resetForm()
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

  const getAvailableOrderTypes = () => {
    if (!restaurantConfig?.serviceInfo) return []

    const types = []
    if (restaurantConfig.serviceInfo.takeaway) types.push({ value: "takeaway", label: "Para llevar" })
    if (restaurantConfig.serviceInfo.delivery) types.push({ value: "delivery", label: "Delivery" })
    if (restaurantConfig.serviceInfo.dineIn) types.push({ value: "dine-in", label: "Consumir en local" })

    return types
  }

  const getAvailablePaymentMethods = () => {
    if (!restaurantConfig?.paymentInfo) return []

    const methods = []
    if (restaurantConfig.paymentInfo.cash) methods.push({ value: "cash", label: "Efectivo", icon: DollarSign })
    if (restaurantConfig.paymentInfo.card) methods.push({ value: "card", label: "Tarjeta", icon: CreditCard })

    return methods
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "order-type":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">¿Cómo quieres recibir tu pedido?</Label>
              <RadioGroup value={orderType} onValueChange={setOrderType} className="mt-3">
                {getAvailableOrderTypes().map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case "customer-info":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Nombre completo *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Teléfono *</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Tu número de teléfono"
              />
            </div>
            {orderType === "delivery" && (
              <div>
                <Label htmlFor="deliveryAddress">Dirección de entrega *</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Dirección completa para la entrega"
                />
              </div>
            )}
          </div>
        )

      case "payment":
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Método de pago</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-3">
                {getAvailablePaymentMethods().map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label htmlFor={method.value} className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="needsChange"
                    checked={needsChange}
                    onChange={(e) => setNeedsChange(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="needsChange">Necesito vuelto</Label>
                </div>

                {needsChange && (
                  <div>
                    <Label htmlFor="cashAmount">¿Con cuánto vas a pagar?</Label>
                    <Input
                      id="cashAmount"
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Monto en efectivo"
                      min={totalPrice}
                      step="0.01"
                    />
                    {cashAmount && Number.parseFloat(cashAmount) >= totalPrice && (
                      <p className="text-sm text-green-600 mt-1">Vuelto: ${changeAmount.toFixed(2)}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notas adicionales (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales para tu pedido"
              />
            </div>
          </div>
        )

      case "summary":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Resumen del pedido</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Tipo:</strong> {getAvailableOrderTypes().find((t) => t.value === orderType)?.label}
              </div>
              <div>
                <strong>Cliente:</strong> {customerName}
              </div>
              <div>
                <strong>Teléfono:</strong> {customerPhone}
              </div>
              {orderType === "delivery" && (
                <div>
                  <strong>Dirección:</strong> {deliveryAddress}
                </div>
              )}
              <div>
                <strong>Pago:</strong> {getAvailablePaymentMethods().find((m) => m.value === paymentMethod)?.label}
              </div>
              {paymentMethod === "cash" && needsChange && (
                <div>
                  <strong>Paga con:</strong> ${cashAmount} (Vuelto: ${changeAmount.toFixed(2)})
                </div>
              )}
              {notes && (
                <div>
                  <strong>Notas:</strong> {notes}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case "order-type":
        return orderType !== ""
      case "customer-info":
        return customerName && customerPhone && (orderType !== "delivery" || deliveryAddress)
      case "payment":
        return paymentMethod && (!needsChange || (cashAmount && Number.parseFloat(cashAmount) >= totalPrice))
      case "summary":
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar pedido</DialogTitle>
          <DialogDescription>Completa los datos para confirmar tu pedido</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between">
            {currentStep !== "order-type" && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
            )}

            <div className="ml-auto">
              {currentStep === "summary" ? (
                <Button onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar pedido"}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
