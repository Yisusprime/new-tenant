"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useParams } from "next/navigation"

// Tipos
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

interface ServiceOptions {
  offersPickup: boolean
  offersTakeaway: boolean
  offersDelivery: boolean
  deliveryFee: number
}

interface PaymentMethods {
  acceptsCash: boolean
  acceptsCard: boolean
  acceptsTransfer: boolean
  onlinePaymentInstructions?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  updateItemNotes: (itemId: string, notes: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  tax: number
  total: number
  isStoreOpen: boolean
  serviceOptions: ServiceOptions
  paymentMethods: PaymentMethods
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Valores por defecto
const defaultServiceOptions: ServiceOptions = {
  offersPickup: true,
  offersTakeaway: true,
  offersDelivery: true,
  deliveryFee: 5.0,
}

const defaultPaymentMethods: PaymentMethods = {
  acceptsCash: true,
  acceptsCard: true,
  acceptsTransfer: true,
  onlinePaymentInstructions: "Transferir a la cuenta: 1234-5678-9012-3456",
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isStoreOpen, setIsStoreOpen] = useState(false)
  const [serviceOptions, setServiceOptions] = useState<ServiceOptions>(defaultServiceOptions)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>(defaultPaymentMethods)
  const params = useParams()
  const tenantId = params?.tenant || ""

  // Cargar items del localStorage al iniciar
  useEffect(() => {
    const savedItems = localStorage.getItem("cartItems")
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems))
      } catch (error) {
        console.error("Error parsing cart items from localStorage:", error)
        localStorage.removeItem("cartItems")
      }
    }
  }, [])

  // Guardar items en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(items))
  }, [items])

  // Verificar si la tienda está abierta
  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const shifts = snapshot.val()
        // Verificar si hay algún turno activo (sin endTime)
        const activeShift = Object.values(shifts).some((shift: any) => !shift.endTime)
        setIsStoreOpen(activeShift)
      } else {
        setIsStoreOpen(false)
      }
    }

    onValue(shiftsRef, handleShiftsChange)

    return () => {
      off(shiftsRef, "value", handleShiftsChange)
    }
  }, [tenantId])

  // Cargar configuración de servicios y pagos
  useEffect(() => {
    if (!tenantId) return

    const configRef = ref(rtdb, `tenants/${tenantId}/config`)

    const handleConfigChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const config = snapshot.val()

        if (config.serviceOptions) {
          setServiceOptions({
            offersPickup: config.serviceOptions.offersPickup ?? defaultServiceOptions.offersPickup,
            offersTakeaway: config.serviceOptions.offersTakeaway ?? defaultServiceOptions.offersTakeaway,
            offersDelivery: config.serviceOptions.offersDelivery ?? defaultServiceOptions.offersDelivery,
            deliveryFee: config.serviceOptions.deliveryFee ?? defaultServiceOptions.deliveryFee,
          })
        }

        if (config.paymentMethods) {
          setPaymentMethods({
            acceptsCash: config.paymentMethods.acceptsCash ?? defaultPaymentMethods.acceptsCash,
            acceptsCard: config.paymentMethods.acceptsCard ?? defaultPaymentMethods.acceptsCard,
            acceptsTransfer: config.paymentMethods.acceptsTransfer ?? defaultPaymentMethods.acceptsTransfer,
            onlinePaymentInstructions:
              config.paymentMethods.onlinePaymentInstructions ?? defaultPaymentMethods.onlinePaymentInstructions,
          })
        }
      }
    }

    onValue(configRef, handleConfigChange)

    return () => {
      off(configRef, "value", handleConfigChange)
    }
  }, [tenantId])

  // Añadir item al carrito
  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          JSON.stringify(item.extras.map((e) => e.extraId).sort()) ===
            JSON.stringify(newItem.extras.map((e) => e.extraId).sort()),
      )

      if (existingItemIndex >= 0) {
        // Si el producto ya existe con los mismos extras, actualizar cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Si no existe, añadir nuevo item
        return [...prevItems, newItem]
      }
    })
  }

  // Eliminar item del carrito
  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  // Actualizar cantidad de un item
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== itemId)
      }

      return prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    })
  }

  // Actualizar notas de un item
  const updateItemNotes = (itemId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, notes } : item)))
  }

  // Limpiar carrito
  const clearCart = () => {
    setItems([])
  }

  // Calcular número total de items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Calcular subtotal
  const subtotal = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    return total + itemTotal + extrasTotal * item.quantity
  }, 0)

  // Calcular impuestos (10%)
  const tax = subtotal * 0.1

  // Calcular total
  const total = subtotal + tax

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemNotes,
    clearCart,
    itemCount,
    subtotal,
    tax,
    total,
    isStoreOpen,
    serviceOptions,
    paymentMethods,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
