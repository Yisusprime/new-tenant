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
import type { OrderFormData, OrderItem, OrderType } from "@/lib/types/order"
import type { Table } from "@/lib/services/table-service"
import { createOrder } from "@/lib/services/order-service"
import { getTables } from "@/lib/services/table-service"
import { getProducts } from "@/lib/services/product-service"
import { getProductExtras } from "@/lib/services/product-service"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import type { Product, ProductExtra } from "@/lib/types/product"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { ProductSelector } from "./product-selector"
import { OrderTypeStep } from "./order-type-step"
import { CustomerInfoStep } from "./customer-info-step"
import { ProductsStep } from "./products-step"
import { PaymentStep } from "./payment-step"
import { OrderSummary } from "./order-summary"

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
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [productSelectorOpen, setProductSelectorOpen] = useState(false)

  // Estados para propinas y cupones
  const [tipAmount, setTipAmount] = useState(0)
  const [tipPercentage, setTipPercentage] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [cashAmount, setCashAmount] = useState("")
  const [changeAmount, setChangeAmount] = useState(0)

  // Estado para la configuración del IVA y moneda
  const [taxIncluded, setTaxIncluded] = useState(true)
  const [taxRate, setTaxRate] = useState(0.19) // 19% por defecto (Chile)
  const [currencyCode, setCurrencyCode] = useState("CLP") // Peso chileno por defecto

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
      loadRestaurantConfig()

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

  // Calcular el cambio cuando se modifica el monto en efectivo
  useEffect(() => {
    if (paymentMethod === "cash" && cashAmount) {
      const cashValue = Number.parseFloat(cashAmount) || 0
      const totalValue = calculateTotal()
      setChangeAmount(Math.max(0, cashValue - totalValue))
    } else {
      setChangeAmount(0)
    }
  }, [cashAmount, paymentMethod, items, tipAmount, couponDiscount, taxIncluded])

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

  const loadRestaurantConfig = async () => {
    try {
      const config = await getRestaurantConfig(tenantId, branchId)
      if (config && config.basicInfo) {
        // Establecer la configuración de IVA
        const isTaxEnabled = config.basicInfo.taxEnabled !== undefined ? config.basicInfo.taxEnabled : true
        setTaxIncluded(config.basicInfo.taxIncluded)

        // Si el IVA está desactivado, establecer la tasa a 0
        if (!isTaxEnabled) {
          setTaxRate(0)
        } else {
          // Establecer la tasa de IVA (con valor predeterminado de 0.19 si no está definido)
          setTaxRate(config.basicInfo.taxRate !== undefined ? config.basicInfo.taxRate : 0.19)
        }

        // Establecer el código de moneda (con valor predeterminado de CLP si no está definido)
        setCurrencyCode(config.basicInfo.currencyCode || "CLP")
      }
    } catch (error) {
      console.error("Error al cargar configuración del restaurante:", error)
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

  const calculateTaxAmount = () => {
    // Si el IVA está incluido o está desactivado (taxRate === 0), no se añade al total
    if (taxIncluded || taxRate === 0) {
      return 0
    }
    const subtotal = calculateSubtotal()
    return Math.round(subtotal * taxRate)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTaxAmount()
    return subtotal + tax + tipAmount - couponDiscount
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
      if (items.length === 0) {
        newErrors.items = "Debe agregar al menos un producto al pedido"
      }
    }

    if (step === 3) {
      // Solo validamos el nombre como obligatorio
      if (!customerName.trim()) {
        newErrors.customerName = "El nombre del cliente es obligatorio"
      }

      // Validamos teléfono solo si es delivery
      if (orderType === "delivery" && !customerPhone.trim()) {
        newErrors.customerPhone = "El teléfono del cliente es obligatorio para delivery"
      }
    }

    if (step === 4) {
      if (!paymentMethod) {
        newErrors.paymentMethod = "Debe seleccionar un método de pago"
      }

      // Validar monto en efectivo si el método es cash
      if (paymentMethod === "cash" && Number.parseFloat(cashAmount || "0") < calculateTotal()) {
        newErrors.cashAmount = "El monto en efectivo debe ser igual o mayor al total"
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

      const subtotal = calculateSubtotal()
      const tax = calculateTaxAmount()
      const total = calculateTotal()

      const orderData: OrderFormData = {
        type: orderType,
        items,
        customerName: customerName.trim(),
        paymentMethod,
        subtotal,
        tax,
        total,
        taxIncluded,
      }

      // Campos opcionales
      if (customerPhone.trim()) {
        orderData.customerPhone = customerPhone.trim()
      }

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

      // Información de pago en efectivo
      if (paymentMethod === "cash" && Number.parseFloat(cashAmount) > 0) {
        orderData.cashDetails = {
          amountReceived: Number.parseFloat(cashAmount),
          change: changeAmount,
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
    setCashAmount("")
    setChangeAmount(0)
    setCurrentStep(1)
    setErrors({})
  }

  // Renderizado de los pasos
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OrderTypeStep
            orderType={orderType}
            setOrderType={setOrderType}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
            tables={tables}
            deliveryStreet={deliveryStreet}
            setDeliveryStreet={setDeliveryStreet}
            deliveryNumber={deliveryNumber}
            setDeliveryNumber={setDeliveryNumber}
            deliveryCity={deliveryCity}
            setDeliveryCity={setDeliveryCity}
            deliveryZipCode={deliveryZipCode}
            setDeliveryZipCode={setDeliveryZipCode}
            deliveryNotes={deliveryNotes}
            setDeliveryNotes={setDeliveryNotes}
            errors={errors}
          />
        )
      case 2:
        return (
          <ProductsStep
            items={items}
            setItems={setItems}
            setProductSelectorOpen={setProductSelectorOpen}
            handleRemoveItem={handleRemoveItem}
            handleUpdateItemQuantity={handleUpdateItemQuantity}
            errors={errors}
            currencyCode={currencyCode}
          />
        )
      case 3:
        return (
          <CustomerInfoStep
            orderType={orderType}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            errors={errors}
          />
        )
      case 4:
        return (
          <PaymentStep
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            tipPercentage={tipPercentage}
            setTipPercentage={setTipPercentage}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponDiscount={couponDiscount}
            setCouponDiscount={setCouponDiscount}
            cashAmount={cashAmount}
            setCashAmount={setCashAmount}
            changeAmount={changeAmount}
            calculateTotal={calculateTotal}
            handleTipPercentageChange={handleTipPercentageChange}
            handleCustomTipChange={handleCustomTipChange}
            errors={errors}
            currencyCode={currencyCode}
          />
        )
      default:
        return null
    }
  }

  // Renderizado de la barra de progreso
  const renderProgressBar = () => {
    return (
      <div className="w-full mb-6">
        <div className="flex justify-between mb-2">
          <div className="text-xs">Paso {currentStep} de 4</div>
          <div className="text-xs font-medium">
            {currentStep === 1 && "Tipo de Pedido"}
            {currentStep === 2 && "Productos"}
            {currentStep === 3 && "Cliente"}
            {currentStep === 4 && "Pago"}
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
            <div className="md:col-span-1">
              <OrderSummary
                orderType={orderType}
                items={items}
                customerName={customerName}
                paymentMethod={paymentMethod}
                selectedTableId={selectedTableId}
                tables={tables}
                cashAmount={cashAmount}
                changeAmount={changeAmount}
                tipAmount={tipAmount}
                tipPercentage={tipPercentage}
                couponDiscount={couponDiscount}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
                taxIncluded={taxIncluded}
                taxAmount={calculateTaxAmount()}
                taxRate={taxRate}
                currencyCode={currencyCode}
              />
            </div>
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
        tenantId={tenantId}
        branchId={branchId}
        currencyCode={currencyCode}
      />
    </>
  )
}
