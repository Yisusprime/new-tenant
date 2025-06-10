"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { X, MapPin, Clock, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { createOrder } from "@/lib/services/order-service"
import type { RestaurantConfig } from "@/lib/services/restaurant-config-service"
import type { OrderFormData } from "@/lib/types/order"
import { useBranch } from "@/lib/context/branch-context"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
  cartItems: any[]
  totalPrice: number
  onOrderComplete: () => void
}

type ServiceType = "dineIn" | "delivery" | "takeout"
type PaymentMethod = "cash" | "credit_card" | "debit_card" | "transfer"

export function Checkout({ isOpen, onClose, cartItems, totalPrice, onOrderComplete }: CheckoutProps) {
  const params = useParams()
  const tenantId = params.tenantId as string
  const { currentBranch } = useBranch()
  const { toast } = useToast()

  // Estados del checkout
  const [step, setStep] = useState(1)
  const [serviceType, setServiceType] = useState<ServiceType | "">("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [needsChange, setNeedsChange] = useState<boolean | null>(null)
  const [changeAmount, setChangeAmount] = useState("")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })
  const [processing, setProcessing] = useState(false)

  // Configuración del restaurante
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar configuración del restaurante
  useEffect(() => {
    async function loadConfig() {
      if (!currentBranch) {
        console.log("No hay sucursal seleccionada")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log(`Obteniendo configuración para tenant: ${tenantId}, sucursal: ${currentBranch.id}`)
        const config = await getRestaurantConfig(tenantId, currentBranch.id)
        console.log(`Configuración obtenida para sucursal ${currentBranch.id}:`, config)
        setRestaurantConfig(config)
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración del restaurante",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadConfig()
    }
  }, [isOpen, tenantId, currentBranch, toast])

  // Obtener servicios disponibles
  const getAvailableServices = () => {
    if (!restaurantConfig?.serviceMethods) return []

    const services = []
    if (restaurantConfig.serviceMethods.dineIn) {
      services.push({ id: "dineIn", name: "En el Local", icon: Building2 })
    }
    if (restaurantConfig.serviceMethods.delivery) {
      services.push({ id: "delivery", name: "Delivery", icon: MapPin })
    }
    if (restaurantConfig.serviceMethods.takeout) {
      services.push({ id: "takeout", name: "Para Llevar", icon: Clock })
    }
    return services
  }

  // Obtener métodos de pago disponibles
  const getAvailablePaymentMethods = () => {
    if (!restaurantConfig?.paymentMethods?.methods) return []

    return restaurantConfig.paymentMethods.methods
      .filter((method) => method.isActive)
      .map((method) => ({
        id: method.id,
        name: method.name,
        icon: getPaymentIcon(method.id),
      }))
  }

  const getPaymentIcon = (methodId: string) => {
    switch (methodId) {
      case "cash":
        return Banknote
      case "credit_card":
      case "debit_card":
        return CreditCard
      case "transfer":
        return Smartphone
      default:
        return CreditCard
    }
  }

  const handleNextStep = () => {
    if (step === 1 && !serviceType) {
      toast({
        title: "Selecciona un servicio",
        description: "Debes elegir cómo quieres recibir tu pedido",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && !paymentMethod) {
      toast({
        title: "Selecciona un método de pago",
        description: "Debes elegir cómo vas a pagar",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && paymentMethod === "cash" && needsChange === null) {
      toast({
        title: "Confirma si necesitas vuelto",
        description: "Indica si pagarás con el monto exacto o necesitas vuelto",
        variant: "destructive",
      })
      return
    }

    if (step === 2 && paymentMethod === "cash" && needsChange && !changeAmount) {
      toast({
        title: "Indica el monto con el que pagarás",
        description: "Necesitamos saber con cuánto dinero vas a pagar",
        variant: "destructive",
      })
      return
    }

    if (step === 3) {
      // Validar información del cliente según el tipo de servicio
      if (serviceType === "delivery" && (!customerInfo.name || !customerInfo.phone || !customerInfo.address)) {
        toast({
          title: "Completa la información",
          description: "Para delivery necesitamos tu nombre, teléfono y dirección",
          variant: "destructive",
        })
        return
      }

      if ((serviceType === "dineIn" || serviceType === "takeout") && (!customerInfo.name || !customerInfo.phone)) {
        toast({
          title: "Completa la información",
          description: "Necesitamos tu nombre y teléfono para contactarte",
          variant: "destructive",
        })
        return
      }

      // Procesar pedido
      handleOrderSubmit()
      return
    }

    setStep(step + 1)
  }

  const handleOrderSubmit = async () => {
    if (!currentBranch) {
      toast({
        title: "Error",
        description: "No hay sucursal seleccionada",
        variant: "destructive",
      })
      return
    }

    try {
      setProcessing(true)

      // Convertir items del carrito al formato esperado por el servicio
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal:
          (item.price + (item.extras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0)) * item.quantity,
        extras: item.extras || [],
        image: item.image,
      }))

      // Crear el objeto de datos del pedido
      const orderData: OrderFormData = {
        type: serviceType === "dineIn" ? "table" : serviceType,
        items: orderItems,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        deliveryAddress: serviceType === "delivery" ? customerInfo.address : undefined,
        paymentMethod: paymentMethod,
        notes: customerInfo.notes || undefined,
      }

      console.log("Creando pedido:", orderData)

      // Crear el pedido en Firebase
      const newOrder = await createOrder(tenantId, currentBranch.id, orderData)

      console.log("Pedido creado exitosamente:", newOrder)

      toast({
        title: "¡Pedido realizado!",
        description: `Tu pedido #${newOrder.orderNumber} ha sido enviado correctamente`,
      })

      onOrderComplete()
    } catch (error) {
      console.error("Error al procesar pedido:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Cargando configuración...</div>
        </div>
      </div>
    )
  }

  if (!restaurantConfig) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Error de Configuración</h3>
          <p className="text-gray-600 mb-4">No se pudo cargar la configuración del restaurante</p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    )
  }

  const availableServices = getAvailableServices()
  const availablePaymentMethods = getAvailablePaymentMethods()

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {step === 1 && "Tipo de Servicio"}
            {step === 2 && "Método de Pago"}
            {step === 3 && "Información de Contacto"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={processing}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Paso 1: Tipo de Servicio */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">¿Cómo quieres recibir tu pedido?</p>

              <RadioGroup value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
                {availableServices.map((service) => {
                  const IconComponent = service.icon
                  return (
                    <div key={service.id} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={service.id} id={service.id} />
                      <IconComponent className="h-5 w-5 text-gray-500" />
                      <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                        {service.name}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {availableServices.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay servicios disponibles en este momento</p>
              )}
            </div>
          )}

          {/* Paso 2: Método de Pago */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">¿Cómo vas a pagar?</p>

              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                {availablePaymentMethods.map((method) => {
                  const IconComponent = method.icon
                  return (
                    <div key={method.id} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <IconComponent className="h-5 w-5 text-gray-500" />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        {method.name}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>

              {/* Opciones adicionales para efectivo */}
              {paymentMethod === "cash" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Opciones de Efectivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RadioGroup
                      value={needsChange === null ? "" : needsChange ? "yes" : "no"}
                      onValueChange={(value) => {
                        setNeedsChange(value === "yes")
                        if (value === "no") {
                          setChangeAmount("")
                        }
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="exact" />
                        <Label htmlFor="exact">Pago exacto (${totalPrice.toFixed(2)})</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="change" />
                        <Label htmlFor="change">Necesito vuelto</Label>
                      </div>
                    </RadioGroup>

                    {needsChange && (
                      <div className="space-y-2">
                        <Label htmlFor="changeAmount">¿Con cuánto vas a pagar?</Label>
                        <Input
                          id="changeAmount"
                          type="number"
                          placeholder="Ej: 15000"
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(e.target.value)}
                          min={totalPrice}
                        />
                        {changeAmount && Number(changeAmount) > totalPrice && (
                          <p className="text-sm text-green-600">
                            Vuelto: ${(Number(changeAmount) - totalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Paso 3: Información del Cliente */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Completa tu información de contacto</p>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Tu número de teléfono"
                  />
                </div>

                {serviceType !== "dineIn" && (
                  <div>
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                )}

                {serviceType === "delivery" && (
                  <div>
                    <Label htmlFor="address">Dirección de entrega *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Dirección completa con referencias"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Instrucciones especiales, alergias, etc."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resumen del pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>
                    $
                    {(
                      (item.price + (item.extras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0)) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botones de navegación */}
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" disabled={processing}>
                Atrás
              </Button>
            )}
            <Button onClick={handleNextStep} className="flex-1" disabled={processing}>
              {processing ? "Procesando..." : step === 3 ? "Confirmar Pedido" : "Continuar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
