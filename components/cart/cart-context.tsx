"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { ref, onValue, off, get } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  notes?: string
  extras: CartItemExtra[]
}

export interface CartItemExtra {
  id: string
  extraId: string
  name: string
  price: number
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  updateItemNotes: (itemId: string, notes: string) => void
  addItemExtra: (itemId: string, extra: CartItemExtra) => void
  removeItemExtra: (itemId: string, extraId: string) => void
  updateItemExtraQuantity: (itemId: string, extraId: string, quantity: number) => void
  clearCart: () => void
  isStoreOpen: boolean
  subtotal: number
  tax: number
  total: number
  itemCount: number
  serviceOptions: {
    offersPickup: boolean
    offersTakeaway: boolean
    offersDelivery: boolean
    deliveryFee: number
    freeDeliveryThreshold: number
    deliveryRadius: number
    estimatedDeliveryTime: number
  }
  paymentMethods: {
    acceptsCash: boolean
    acceptsCard: boolean
    acceptsTransfer: boolean
    acceptsOnlinePayment: boolean
    onlinePaymentInstructions: string
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
  tenantId: string
}

export function CartProvider({ children, tenantId }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isStoreOpen, setIsStoreOpen] = useState(false)
  const [serviceOptions, setServiceOptions] = useState({
    offersPickup: true,
    offersTakeaway: true,
    offersDelivery: false,
    deliveryFee: 0,
    freeDeliveryThreshold: 0,
    deliveryRadius: 0,
    estimatedDeliveryTime: 30,
  })
  const [paymentMethods, setPaymentMethods] = useState({
    acceptsCash: true,
    acceptsCard: true,
    acceptsTransfer: false,
    acceptsOnlinePayment: false,
    onlinePaymentInstructions: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  // Cargar el carrito desde localStorage al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(`cart-${tenantId}`)
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error)
        }
      }
    }
  }, [tenantId])

  // Guardar el carrito en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== "undefined" && items.length > 0) {
      localStorage.setItem(`cart-${tenantId}`, JSON.stringify(items))
    }
  }, [items, tenantId])

  // Verificar si la tienda está abierta (hay un turno activo)
  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsUpdate = (snapshot: any) => {
      const shiftsData = snapshot.val() || {}

      // Buscar si hay algún turno activo
      const hasActiveShift = Object.values(shiftsData).some((shift: any) => shift.status === "active")

      setIsStoreOpen(hasActiveShift)
    }

    // Establecer el listener
    onValue(shiftsRef, handleShiftsUpdate)

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      off(shiftsRef)
    }
  }, [tenantId])

  // Cargar opciones de servicio y métodos de pago
  useEffect(() => {
    if (!tenantId) return

    const tenantRef = ref(rtdb, `tenants/${tenantId}/settings`)

    const loadSettings = async () => {
      try {
        const snapshot = await get(tenantRef)
        const settings = snapshot.val() || {}

        if (settings.serviceOptions) {
          setServiceOptions({
            ...serviceOptions,
            ...settings.serviceOptions,
          })
        }

        if (settings.paymentMethods) {
          setPaymentMethods({
            ...paymentMethods,
            ...settings.paymentMethods,
          })
        }
      } catch (error) {
        console.error("Error loading tenant settings:", error)
      }
    }

    loadSettings()
  }, [tenantId])

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex((i) => i.productId === item.productId)

      if (existingItemIndex >= 0) {
        // Si el producto ya existe, incrementar la cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += item.quantity

        toast({
          title: "Producto actualizado",
          description: `Se actualizó la cantidad de ${item.name} en el carrito.`,
        })

        return updatedItems
      } else {
        // Si es un producto nuevo, añadirlo al carrito
        toast({
          title: "Producto añadido",
          description: `${item.name} se añadió al carrito.`,
        })

        return [...prevItems, item]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === itemId)

      if (itemToRemove) {
        toast({
          title: "Producto eliminado",
          description: `${itemToRemove.name} se eliminó del carrito.`,
        })
      }

      return prevItems.filter((item) => item.id !== itemId)
    })
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  const updateItemNotes = (itemId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, notes } : item)))
  }

  const addItemExtra = (itemId: string, extra: CartItemExtra) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          // Verificar si el extra ya existe
          const existingExtraIndex = item.extras.findIndex((e) => e.extraId === extra.extraId)

          if (existingExtraIndex >= 0) {
            // Si el extra ya existe, incrementar la cantidad
            const updatedExtras = [...item.extras]
            updatedExtras[existingExtraIndex].quantity += extra.quantity
            return { ...item, extras: updatedExtras }
          } else {
            // Si es un extra nuevo, añadirlo
            return {
              ...item,
              extras: [...item.extras, extra],
            }
          }
        }
        return item
      }),
    )
  }

  const removeItemExtra = (itemId: string, extraId: string) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            extras: item.extras.filter((extra) => extra.id !== extraId),
          }
        }
        return item
      }),
    )
  }

  const updateItemExtraQuantity = (itemId: string, extraId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemExtra(itemId, extraId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            extras: item.extras.map((extra) => (extra.id === extraId ? { ...extra, quantity } : extra)),
          }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setItems([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(`cart-${tenantId}`)
    }
  }

  // Calcular subtotal
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.price * item.quantity
    const extrasPrice = item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    return total + itemPrice + extrasPrice
  }, 0)

  // Calcular impuestos (10%)
  const tax = subtotal * 0.1

  // Calcular total
  const total = subtotal + tax

  // Contar número de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemNotes,
    addItemExtra,
    removeItemExtra,
    updateItemExtraQuantity,
    clearCart,
    isStoreOpen,
    subtotal,
    tax,
    total,
    itemCount,
    serviceOptions,
    paymentMethods,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
