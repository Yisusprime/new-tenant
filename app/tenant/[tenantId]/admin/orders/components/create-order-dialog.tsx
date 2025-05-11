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
import type { OrderFormData, OrderItem, OrderType } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"
import { createOrder } from "@/lib/services/order-service"
import { getTables } from "@/lib/services/table-service"
import { getProducts } from "@/lib/services/product-service"
import { getProductExtras } from "@/lib/services/product-service"
import type { Product, ProductExtra } from "@/lib/types/product"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Minus,
  Package,
  Percent,
  Plus,
  Save,
  ShoppingBag,
  Tag,
  Trash2,
  User,
  Utensils,
} from "lucide-react"
import { ProductSelector } from "./product-selector"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onOrderCreated: () => void
  selectedTable?: Table | null
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  tenantId,
  branchId,
  onOrderCreated,
  selectedTable,
}: CreateOrderDialogProps) {
  // Estados para los datos del pedido
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [orderType, setOrderType] = useState<OrderType>("local")
  const [items, setItems] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [deliveryStreet, setDeliveryStreet] = useState("")
  const [deliveryNumber, setDeliveryNumber] = useState("")
  const [deliveryCity, setDeliveryCity] = useState("")
  const [deliveryZipCode, setDeliveryZipCode] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash") // Cambia de "" a "cash"
  const [productSelectorOpen, setProductSelectorOpen] = useState(false)

  // Estados para propinas y cupones
  const [tipAmount, setTipAmount] = useState(0)
  const [tipPercentage, setTipPercentage] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)

  // Estados para el wizard
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Asegurarnos de que selectedTableId nunca sea una cadena vacía
  useEffect(() => {
    if (selectedTableId === "") {
      console.warn("selectedTableId es una cadena vacía, estableciendo a null")
      setSelectedTableId("no-selection")
    }
  }, [selectedTableId])

  // Cargar datos al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadProducts()
      loadExtras()
      loadTables()

      // Si hay una mesa seleccionada, establecer el tipo de pedido a "table"
      if (selectedTable && selectedTable.id) {
        setOrderType("table")
        setSelectedTableId(selectedTable.id)
        // Establecer un método de pago por defecto para evitar el error de Select.Item
        setPaymentMethod("cash")
        console.log("Mesa seleccionada:", selectedTable)
      } else if (selectedTable) {
        console.error("Error: Mesa seleccionada sin ID", selectedTable)
      }
    }
  }, [open, tenantId, branchId, selectedTable])

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

  const loadTables = async () => {
    try {
      const tablesData = await getTables(tenantId, branchId)
      // Filtrar solo mesas activas y disponibles
      setTables(tablesData.filter((t) => t.isActive && (t.status === "available" || t.status === "reserved")))
    } catch (error) {
      console.error("Error al cargar mesas:", error)
    }
  }

  // Funciones para manejar productos
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

  // Funciones para propinas
  const handleTipPercentageChange = (percentage: number) => {
    setTipPercentage(percentage)
    const subtotal = calculateSubtotal()
    setTipAmount(Math.round(subtotal * (percentage / 100)))
  }

  const handleCustomTipChange = (value: string) => {
    const amount = Number.parseFloat(value) || 0
    setTipAmount(amount)
    const subtotal = calculateSubtotal()
    setTipPercentage(subtotal > 0 ? Math.round((amount / subtotal) * 100) : 0)
  }

  // Funciones para cálculos
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + tipAmount - couponDiscount
  }

  // Validación por pasos
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!orderType) {
        newErrors.orderType = "Debe seleccionar un tipo de pedido"
      }

      if (orderType === "table" && !selectedTableId) {
        newErrors.tableId = "Debe seleccionar una mesa"
      }

      if (orderType === "delivery") {
        if (!deliveryStreet.trim()) {
          newErrors.deliveryStreet = "La calle es obligatoria"
        }
        if (!deliveryNumber.trim()) {
          newErrors.deliveryNumber = "El número es obligatorio"
        }
        if (!deliveryCity.trim()) {
          newErrors.deliveryCity = "La ciudad es obligatoria"
        }
      }
    }

    if (step === 2) {
      if (!customerName.trim()) {
        newErrors.customerName = "El nombre del cliente es obligatorio"
      }
      if (!customerPhone.trim()) {
        newErrors.customerPhone = "El teléfono del cliente es obligatorio"
      }
    }

    if (step === 3) {
      if (!paymentMethod) {
        newErrors.paymentMethod = "Debe seleccionar un método de pago"
      }
    }

    if (step === 4) {
      if (items.length === 0) {
        newErrors.items = "Debe agregar al menos un producto al pedido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Envío del formulario
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      return
    }

    try {
      setLoading(true)

      const orderData: OrderFormData = {
        type: orderType,
        items,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
      }

      // Campos opcionales
      if (customerEmail.trim()) {
        orderData.customerEmail = customerEmail.trim()
      }

      // Campos específicos según el tipo de pedido
      if (orderType === "table") {
        const selectedTable = tables.find((t) => t.id === selectedTableId)
        orderData.tableId = selectedTableId
        if (selectedTable) {
          orderData.tableNumber = selectedTable.number
        }
      } else if (orderType === "delivery") {
        orderData.deliveryAddress = {
          street: deliveryStreet.trim(),
          number: deliveryNumber.trim(),
          city: deliveryCity.trim(),
        }

        if (deliveryZipCode.trim()) {
          orderData.deliveryAddress.zipCode = deliveryZipCode.trim()
        }

        if (deliveryNotes.trim()) {
          orderData.deliveryAddress.notes = deliveryNotes.trim()
        }
      }

      // Propina y cupón
      if (tipAmount > 0) {
        orderData.tip = tipAmount
      }

      if (couponCode.trim() && couponDiscount > 0) {
        orderData.coupon = {
          code: couponCode.trim(),
          discount: couponDiscount,
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
    setSelectedTableId("")
    setDeliveryStreet("")
    setDeliveryNumber("")
    setDeliveryCity("")
    setDeliveryZipCode("")
    setDeliveryNotes("")
    setPaymentMethod("cash")
    setTipAmount(0)
    setTipPercentage(0)
    setCouponCode("")
    setCouponDiscount(0)
    setCurrentStep(1)
    setErrors({})
  }

  // Renderizado de los pasos
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderOrderTypeStep()
      case 2:
        return renderCustomerInfoStep()
      case 3:
        return renderPaymentStep()
      case 4:
        return renderProductsStep()
      default:
        return null
    }
  }

  const renderOrderTypeStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="orderType" className="text-base font-medium flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Tipo de Pedido <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
            <SelectTrigger id="orderType" className={errors.orderType ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar tipo de pedido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">
                <div className="flex items-center">
                  <Utensils className="w-4 h-4 mr-2" />
                  Consumo en Local
                </div>
              </SelectItem>
              <SelectItem value="takeaway">
                <div className="flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Para Llevar
                </div>
              </SelectItem>
              <SelectItem value="table">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Mesa
                </div>
              </SelectItem>
              <SelectItem value="delivery">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Delivery
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.orderType && <p className="text-red-500 text-sm">{errors.orderType}</p>}
        </div>

        {orderType === "table" && (
          <div className="space-y-2">
            <Label htmlFor="tableId" className="text-base font-medium flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Mesa <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={selectedTableId || "no-selection"}
              onValueChange={(value) => {
                console.log("Mesa seleccionada:", value)
                setSelectedTableId(value)
              }}
            >
              <SelectTrigger id="tableId" className={errors.tableId ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar mesa" />
              </SelectTrigger>
              <SelectContent>
                {tables.length === 0 ? (
                  <SelectItem value="no-tables" disabled>
                    No hay mesas disponibles
                  </SelectItem>
                ) : (
                  tables
                    .filter((table) => !!table.id)
                    .map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Mesa {table.number} ({table.capacity} personas)
                      </SelectItem>
                    ))
                )}
                <SelectItem value="no-selection" disabled className="hidden">
                  Seleccionar mesa
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.tableId && <p className="text-red-500 text-sm">{errors.tableId}</p>}
          </div>
        )}

        {orderType === "delivery" && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Dirección de Entrega
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryStreet" className="flex items-center">
                  Calle <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="deliveryStreet"
                  value={deliveryStreet}
                  onChange={(e) => setDeliveryStreet(e.target.value)}
                  placeholder="Ej: Av. Principal"
                  className={errors.deliveryStreet ? "border-red-500" : ""}
                />
                {errors.deliveryStreet && <p className="text-red-500 text-sm">{errors.deliveryStreet}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNumber" className="flex items-center">
                  Número <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="deliveryNumber"
                  value={deliveryNumber}
                  onChange={(e) => setDeliveryNumber(e.target.value)}
                  placeholder="Ej: 123"
                  className={errors.deliveryNumber ? "border-red-500" : ""}
                />
                {errors.deliveryNumber && <p className="text-red-500 text-sm">{errors.deliveryNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryCity" className="flex items-center">
                  Ciudad <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="deliveryCity"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="Ej: Buenos Aires"
                  className={errors.deliveryCity ? "border-red-500" : ""}
                />
                {errors.deliveryCity && <p className="text-red-500 text-sm">{errors.deliveryCity}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryZipCode">
                  Código Postal <span className="text-gray-500 text-xs">(Opcional)</span>
                </Label>
                <Input
                  id="deliveryZipCode"
                  value={deliveryZipCode}
                  onChange={(e) => setDeliveryZipCode(e.target.value)}
                  placeholder="Ej: 1000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryNotes">
                Notas de Entrega <span className="text-gray-500 text-xs">(Opcional)</span>
              </Label>
              <Textarea
                id="deliveryNotes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Ej: Timbre 2B, edificio azul"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCustomerInfoStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="font-medium flex items-center">
          <User className="w-4 h-4 mr-2" />
          Información del Cliente
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center">
              Nombre <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="flex items-center">
              Teléfono <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ej: +54 11 1234-5678"
              className={errors.customerPhone ? "border-red-500" : ""}
            />
            {errors.customerPhone && <p className="text-red-500 text-sm">{errors.customerPhone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">
              Email <span className="text-gray-500 text-xs">(Opcional)</span>
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Ej: cliente@ejemplo.com"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-base font-medium flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Método de Pago <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod" className={errors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="app">App de Pago</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod}</p>}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium flex items-center">
            <Percent className="w-4 h-4 mr-2" />
            Propina <span className="text-gray-500 text-xs">(Opcional)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={tipPercentage === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => handleTipPercentageChange(0)}
            >
              Sin propina
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 10 ? "default" : "outline"}
              size="sm"
              onClick={() => handleTipPercentageChange(10)}
            >
              10%
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 15 ? "default" : "outline"}
              size="sm"
              onClick={() => handleTipPercentageChange(15)}
            >
              15%
            </Button>
            <Button
              type="button"
              variant={tipPercentage === 20 ? "default" : "outline"}
              size="sm"
              onClick={() => handleTipPercentageChange(20)}
            >
              20%
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="customTip">Monto personalizado:</Label>
            <Input
              id="customTip"
              type="number"
              min="0"
              step="0.01"
              value={tipAmount.toString()}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              className="w-24"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Cupón de Descuento <span className="text-gray-500 text-xs">(Opcional)</span>
          </h3>
          <div className="flex items-center space-x-2">
            <Input
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Código de cupón"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Aquí iría la lógica para validar el cupón
                // Por ahora, simplemente aplicamos un descuento fijo de ejemplo
                if (couponCode.trim()) {
                  setCouponDiscount(500) // $500 de descuento
                }
              }}
            >
              Aplicar
            </Button>
          </div>
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Descuento aplicado:</span>
              <span className="font-medium text-green-600">-{formatCurrency(couponDiscount)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderProductsStep = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Productos <span className="text-red-500 ml-1">*</span>
          </h3>
          <Button onClick={() => setProductSelectorOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-gray-50">
            <p className="text-gray-500">No hay productos en el pedido</p>
            {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
            <Button onClick={() => setProductSelectorOpen(true)} variant="link" className="mt-2">
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
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
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
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Renderizado del resumen del pedido
  const renderOrderSummary = () => {
    const subtotal = calculateSubtotal()
    const total = calculateTotal()

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tipo de pedido:</span>
              <Badge variant="outline">
                {orderType === "local" && "Consumo en Local"}
                {orderType === "takeaway" && "Para Llevar"}
                {orderType === "table" && "Mesa"}
                {orderType === "delivery" && "Delivery"}
              </Badge>
            </div>

            {orderType === "table" && selectedTableId && (
              <div className="flex justify-between text-sm">
                <span>Mesa:</span>
                <span>{tables.find((t) => t.id === selectedTableId)?.number || ""}</span>
              </div>
            )}

            {customerName && (
              <div className="flex justify-between text-sm">
                <span>Cliente:</span>
                <span>{customerName}</span>
              </div>
            )}

            {paymentMethod && (
              <div className="flex justify-between text-sm">
                <span>Método de pago:</span>
                <span>
                  {paymentMethod === "cash" && "Efectivo"}
                  {paymentMethod === "card" && "Tarjeta"}
                  {paymentMethod === "transfer" && "Transferencia"}
                  {paymentMethod === "app" && "App de Pago"}
                </span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Productos:</span>
              <span>{items.length}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            {tipAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Propina ({tipPercentage}%):</span>
                <span>{formatCurrency(tipAmount)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento:</span>
                <span>-{formatCurrency(couponDiscount)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between w-full text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Renderizado de la barra de progreso
  const renderProgressBar = () => {
    return (
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-xs">Paso {currentStep} de 4</div>
          <div className="text-xs font-medium">
            {currentStep === 1 && "Tipo de Pedido"}
            {currentStep === 2 && "Información del Cliente"}
            {currentStep === 3 && "Pago y Descuentos"}
            {currentStep === 4 && "Productos"}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
        </div>
      </div>
    )
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

          {renderProgressBar()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">{renderStepContent()}</div>
            <div className="md:col-span-1">{renderOrderSummary()}</div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={goToPreviousStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}
            </div>
            <div>
              {currentStep < 4 ? (
                <Button type="button" onClick={goToNextStep}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Pedido
                    </>
                  )}
                </Button>
              )}
            </div>
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
