"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useOrderContext } from "./order-context"
import { useTableContext } from "./table-context"
import type { Order, OrderType, OrderItem } from "@/lib/types/orders"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Home, ShoppingBag, MapPin, Utensils, Plus, Minus, Trash2, Tag, CreditCard } from "lucide-react"
import { ref, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// Primero, importa el nuevo componente ProductSelector
import { ProductSelector } from "./product-selector"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  categoryId: string
  available: boolean
}

interface Category {
  id: string
  name: string
}

interface Extra {
  id: string
  name: string
  price: number
  available: boolean
}

interface NewOrderFormProps {
  tenantId: string
  onClose: () => void
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({ tenantId, onClose }) => {
  const { addOrder } = useOrderContext()
  const { tables } = useTableContext()
  const { toast } = useToast()

  const [orderType, setOrderType] = useState<OrderType>("dine-in")
  const [products, setProducts] = useState<Product[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [tableId, setTableId] = useState("")
  const [notes, setNotes] = useState("")
  const [tipAmount, setTipAmount] = useState(0)
  const [tipPercentage, setTipPercentage] = useState(0)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [productSelectorOpen, setProductSelectorOpen] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  // Luego, busca donde se maneja la selección de productos y reemplázalo con:
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  // Cargar productos, extras y categorías
  useEffect(() => {
    if (!tenantId) {
      console.error("No hay tenantId disponible para cargar productos")
      return
    }

    setLoadingProducts(true)
    setLoadingError(null)

    const fetchData = async () => {
      try {
        console.log(`Intentando cargar datos para el tenant: ${tenantId}`)

        // Fetch categories
        const categoriesRef = ref(rtdb, `tenants/${tenantId}/categories`)
        console.log(`Ruta de categorías: tenants/${tenantId}/categories`)
        const categoriesSnapshot = await get(categoriesRef)
        const categoriesData = categoriesSnapshot.val() || {}

        console.log("Datos de categorías cargados:", categoriesData)
        const categoriesList: Category[] = Object.keys(categoriesData).map((key) => ({
          id: key,
          name: categoriesData[key].name,
        }))
        setCategories(categoriesList)
        console.log("Categories loaded:", categoriesList.length)

        // Fetch products
        const productsRef = ref(rtdb, `tenants/${tenantId}/products`)
        console.log(`Ruta de productos: tenants/${tenantId}/products`)
        const productsSnapshot = await get(productsRef)
        const productsData = productsSnapshot.val() || {}

        console.log("Datos de productos cargados:", productsData)
        const productsList: Product[] = Object.keys(productsData).map((key) => ({
          id: key,
          name: productsData[key].name,
          description: productsData[key].description || "",
          price: productsData[key].price || 0,
          imageUrl: productsData[key].imageUrl || "",
          categoryId: productsData[key].categoryId || "",
          available: productsData[key].available !== false, // Por defecto true
        }))
        setProducts(productsList)
        console.log("Products loaded:", productsList.length)

        // Fetch extras
        const extrasRef = ref(rtdb, `tenants/${tenantId}/extras`)
        console.log(`Ruta de extras: tenants/${tenantId}/extras`)
        const extrasSnapshot = await get(extrasRef)
        const extrasData = extrasSnapshot.val() || {}

        console.log("Datos de extras cargados:", extrasData)
        const extrasList: Extra[] = Object.keys(extrasData).map((key) => ({
          id: key,
          name: extrasData[key].name,
          price: extrasData[key].price || 0,
          available: extrasData[key].available !== false, // Por defecto true
        }))
        setExtras(extrasList)
        console.log("Extras loaded:", extrasList.length)

        setLoadingProducts(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoadingError(`Error al cargar los datos: ${error instanceof Error ? error.message : "Desconocido"}`)
        setLoadingProducts(false)
      }
    }

    fetchData()
  }, [tenantId])

  const handleAddItem = (product: Product) => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      discount: 0,
      notes: "",
      extras: [],
      status: "pending",
    }
    setSelectedItems([...selectedItems, newItem])
    setProductSelectorOpen(false)
  }

  const handleAddProduct = (product: Product) => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      discount: 0,
      notes: "",
      extras: [],
      status: "pending",
    }
    setSelectedItems([...selectedItems, newItem])
    setIsProductSelectorOpen(false)
  }

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
  }

  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setSelectedItems(selectedItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const handleAddExtra = (itemId: string, extra: Extra) => {
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.id === itemId) {
          // Check if extra already exists
          const existingExtra = item.extras.find((e) => e.extraId === extra.id)
          if (existingExtra) {
            // Update quantity
            return {
              ...item,
              extras: item.extras.map((e) => (e.extraId === extra.id ? { ...e, quantity: e.quantity + 1 } : e)),
            }
          } else {
            // Add new extra
            return {
              ...item,
              extras: [
                ...item.extras,
                {
                  id: `extra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  extraId: extra.id,
                  name: extra.name,
                  price: extra.price,
                  quantity: 1,
                },
              ],
            }
          }
        }
        return item
      }),
    )
  }

  const handleRemoveExtra = (itemId: string, extraId: string) => {
    setSelectedItems(
      selectedItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            extras: item.extras.filter((e) => e.id !== extraId),
          }
        }
        return item
      }),
    )
  }

  const handleUpdateExtraQuantity = (itemId: string, extraId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveExtra(itemId, extraId)
      return
    }

    setSelectedItems(
      selectedItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            extras: item.extras.map((e) => (e.id === extraId ? { ...e, quantity } : e)),
          }
        }
        return item
      }),
    )
  }

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      const itemTotal = item.price * item.quantity
      const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
      return total + itemTotal + extrasTotal
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    // Assuming tax is 10%
    const tax = subtotal * 0.1
    return subtotal + tax + tipAmount - couponDiscount
  }

  const handleTipPercentageChange = (percentage: number) => {
    setTipPercentage(percentage)
    const subtotal = calculateSubtotal()
    setTipAmount(subtotal * (percentage / 100))
  }

  const handleTipAmountChange = (amount: number) => {
    setTipAmount(amount)
    const subtotal = calculateSubtotal()
    setTipPercentage(subtotal > 0 ? (amount / subtotal) * 100 : 0)
  }

  const handleApplyCoupon = () => {
    // This is a placeholder for coupon validation
    // In a real app, you would validate the coupon against a database
    if (couponCode === "WELCOME10") {
      const subtotal = calculateSubtotal()
      setCouponDiscount(subtotal * 0.1) // 10% discount
      toast({
        title: "Cupón aplicado",
        description: "Se ha aplicado un descuento del 10%",
      })
    } else {
      setCouponDiscount(0)
      toast({
        title: "Cupón inválido",
        description: "El código de cupón no es válido",
        variant: "destructive",
      })
    }
  }

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Debes añadir al menos un producto al pedido",
        variant: "destructive",
      })
      return
    }

    if (orderType === "delivery" && (!customerAddress || !customerPhone)) {
      toast({
        title: "Error",
        description: "Para pedidos de delivery, debes proporcionar dirección y teléfono",
        variant: "destructive",
      })
      return
    }

    if (orderType === "table" && !tableId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una mesa para este tipo de pedido",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const subtotal = calculateSubtotal()
      const tax = subtotal * 0.1 // 10% tax
      const total = calculateTotal()

      const newOrder: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber"> = {
        tenantId,
        type: orderType,
        status: "pending",
        items: selectedItems,
        subtotal,
        tax,
        discount: couponDiscount,
        tip: tipAmount,
        total,
        paymentStatus: "pending",
        paymentMethod: "cash",
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: orderType === "delivery" ? customerAddress : undefined,
        deliveryNotes: orderType === "delivery" ? deliveryNotes : undefined,
        tableId: orderType === "table" ? tableId : undefined,
        notes: notes || undefined,
        couponCode: couponDiscount > 0 ? couponCode : undefined,
        couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
      }

      await addOrder(newOrder)

      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado exitosamente",
      })

      onClose()
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true
    return matchesSearch && matchesCategory && product.available
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b pb-4">
        <h2 className="text-xl font-bold">Nuevo Pedido</h2>
        <p className="text-sm text-muted-foreground">Tenant ID: {tenantId}</p>
      </div>

      <Tabs defaultValue="dine-in" className="flex-grow overflow-hidden flex flex-col">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="dine-in" onClick={() => setOrderType("dine-in")}>
            <Home className="mr-2 h-4 w-4" />
            Local
          </TabsTrigger>
          <TabsTrigger value="takeaway" onClick={() => setOrderType("takeaway")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Llevar
          </TabsTrigger>
          <TabsTrigger value="table" onClick={() => setOrderType("table")}>
            <Utensils className="mr-2 h-4 w-4" />
            Mesa
          </TabsTrigger>
          <TabsTrigger value="delivery" onClick={() => setOrderType("delivery")}>
            <MapPin className="mr-2 h-4 w-4" />
            Delivery
          </TabsTrigger>
        </TabsList>

        <div className="flex-grow overflow-auto">
          <TabsContent value="dine-in" className="mt-0 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Nombre del Cliente (opcional)</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="takeaway" className="mt-0 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="takeaway-name">Nombre del Cliente</Label>
                <Input
                  id="takeaway-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="takeaway-phone">Teléfono (opcional)</Label>
                <Input
                  id="takeaway-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Teléfono del cliente"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-0 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="table-select">Seleccionar Mesa</Label>
                <Select value={tableId} onValueChange={setTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter((table) => table.status === "available")
                      .map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Mesa {table.number} ({table.capacity} personas)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-customer">Nombre del Cliente (opcional)</Label>
                <Input
                  id="table-customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-0 h-full">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-name">Nombre del Cliente</Label>
                <Input
                  id="delivery-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-phone">Teléfono</Label>
                <Input
                  id="delivery-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Teléfono del cliente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Dirección</Label>
                <Input
                  id="delivery-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Dirección de entrega"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-notes">Notas de entrega (opcional)</Label>
                <Textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Instrucciones para el repartidor"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Separator className="my-4" />

      <div className="flex-grow overflow-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Productos</h3>
            <Button variant="outline" onClick={() => setIsProductSelectorOpen(true)}>
              Agregar Producto
            </Button>
            {/* <Sheet open={productSelectorOpen} onOpenChange={setProductSelectorOpen}>
              <SheetContent side="left" className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] p-0 max-w-[1000px]">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Seleccionar Producto</SheetTitle>
                  </SheetHeader>

                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                      >
                        Todos
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-grow overflow-auto p-4">
                    {loadingProducts ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-muted-foreground">Cargando productos...</p>
                      </div>
                    ) : loadingError ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-destructive mb-2">{loadingError}</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setLoadingProducts(true)
                            setLoadingError(null)
                            // Recargar productos
                            const fetchData = async () => {
                              try {
                                const productsRef = ref(rtdb, `tenants/${tenantId}/products`)
                                const snapshot = await get(productsRef)
                                const data = snapshot.val() || {}

                                const productsList = Object.keys(data).map((key) => ({
                                  id: key,
                                  name: data[key].name,
                                  description: data[key].description || "",
                                  price: data[key].price || 0,
                                  imageUrl: data[key].imageUrl || "",
                                  categoryId: data[key].categoryId || "",
                                  available: data[key].available !== false,
                                }))

                                setProducts(productsList)
                                setLoadingProducts(false)
                              } catch (error) {
                                console.error("Error recargando productos:", error)
                                setLoadingError("Error al cargar los productos. Por favor, intenta de nuevo.")
                                setLoadingProducts(false)
                              }
                            }

                            fetchData()
                          }}
                        >
                          Reintentar
                        </Button>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {products.length === 0
                          ? "No hay productos disponibles en la base de datos"
                          : `No se encontraron productos con los filtros actuales. Hay ${products.length} productos en total.`}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredProducts.map((product) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleAddItem(product)}
                          >
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium line-clamp-2">{product.name}</div>
                                <Badge variant="outline" className="ml-2 shrink-0">
                                  ${product.price.toFixed(2)}
                                </Badge>
                              </div>
                              {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                              )}
                              {product.categoryId && categories.find((c) => c.id === product.categoryId) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {categories.find((c) => c.id === product.categoryId)?.name}
                                </div>
                              )}
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full mt-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddItem(product)
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Añadir
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet> */}
            {/* Y donde se renderiza el selector de productos, reemplázalo con: */}
            <ProductSelector
              isOpen={isProductSelectorOpen}
              onOpenChange={setIsProductSelectorOpen}
              tenantId={tenantId}
              selectedCategoryId={selectedCategoryId}
              onProductSelect={(product) => {
                // Aquí va la lógica para agregar el producto seleccionado al pedido
                handleAddProduct(product)
              }}
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                No hay productos seleccionados
              </div>
            ) : (
              selectedItems.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{item.productName}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 ml-2"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {item.extras.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-muted">
                      {item.extras.map((extra) => (
                        <div key={extra.id} className="flex justify-between items-center text-sm">
                          <span>{extra.name}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUpdateExtraQuantity(item.id, extra.id, extra.quantity - 1)}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <span>{extra.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUpdateExtraQuantity(item.id, extra.id, extra.quantity + 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                            <span>${(extra.price * extra.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2">
                    <div className="text-sm font-medium">Añadir extras:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extras
                        .filter((extra) => extra.available)
                        .map((extra) => (
                          <Badge
                            key={extra.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleAddExtra(item.id, extra)}
                          >
                            {extra.name} +${extra.price.toFixed(2)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="order-notes">Notas del Pedido (opcional)</Label>
          <Textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales para el pedido"
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Tag className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Aplicar Cupón</h4>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código de cupón"
                  />
                  <Button onClick={handleApplyCoupon}>Aplicar</Button>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-sm text-green-600">Descuento aplicado: ${couponDiscount.toFixed(2)}</p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <CreditCard className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Añadir Propina</h4>
                <div className="flex gap-2">
                  <Button
                    variant={tipPercentage === 0 ? "default" : "outline"}
                    onClick={() => handleTipPercentageChange(0)}
                  >
                    0%
                  </Button>
                  <Button
                    variant={tipPercentage === 10 ? "default" : "outline"}
                    onClick={() => handleTipPercentageChange(10)}
                  >
                    10%
                  </Button>
                  <Button
                    variant={tipPercentage === 15 ? "default" : "outline"}
                    onClick={() => handleTipPercentageChange(15)}
                  >
                    15%
                  </Button>
                  <Button
                    variant={tipPercentage === 20 ? "default" : "outline"}
                    onClick={() => handleTipPercentageChange(20)}
                  >
                    20%
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Monto:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tipAmount}
                    onChange={(e) => handleTipAmountChange(Number.parseFloat(e.target.value) || 0)}
                    className="max-w-[100px]"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Impuestos (10%):</span>
            <span>${(calculateSubtotal() * 0.1).toFixed(2)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento:</span>
              <span>-${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div className="flex justify-between">
              <span>Propina ({tipPercentage.toFixed(0)}%):</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmitOrder} disabled={loading || selectedItems.length === 0}>
            {loading ? "Procesando..." : "Crear Pedido"}
          </Button>
        </div>
      </div>
    </div>
  )
}
