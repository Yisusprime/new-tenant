"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export interface CartExtra {
  id: string
  extraId: string
  name: string
  price: number
  quantity: number
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  notes?: string
  extras: CartExtra[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  total: number
  tax: number
  isStoreOpen: boolean
  tenantId: string | null
  setTenantId: (id: string | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isStoreOpen, setIsStoreOpen] = useState(true)
  const [isShiftActive, setIsShiftActive] = useState(false)
  const { toast } = useToast()

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambia
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    } else {
      localStorage.removeItem("cart")
    }
  }, [items])

  // Detectar tenantId desde la URL
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  // Verificar si hay un turno activo
  useEffect(() => {
    if (!tenantId) return

    const shiftsRef = ref(rtdb, `tenants/${tenantId}/shifts`)

    const handleShiftsChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const shifts = snapshot.val()
        // Verificar si hay algún turno activo
        const hasActiveShift = Object.values(shifts).some((shift: any) => shift.status === "active")
        setIsShiftActive(hasActiveShift)
      } else {
        setIsShiftActive(false)
      }
    }

    onValue(shiftsRef, handleShiftsChange)

    return () => {
      off(shiftsRef)
    }
  }, [tenantId])

  // Verificar si la tienda está abierta
  useEffect(() => {
    if (!tenantId) return

    // Ahora la tienda está abierta solo si hay un turno activo
    setIsStoreOpen(isShiftActive)
  }, [tenantId, isShiftActive])

  const addItem = (newItem: CartItem) => {
    if (!isStoreOpen) {
      toast({
        title: "Restaurante cerrado",
        description: "Lo sentimos, no se pueden realizar pedidos en este momento.",
        variant: "destructive",
      })
      return
    }

    setItems((currentItems) => {
      // Verificar si el producto ya está en el carrito (sin considerar extras)
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          JSON.stringify(item.extras.map((e) => e.extraId).sort()) ===
            JSON.stringify(newItem.extras.map((e) => e.extraId).sort()) &&
          item.notes === newItem.notes,
      )

      if (existingItemIndex !== -1) {
        // Si el producto ya existe, actualizar la cantidad
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Si es un producto nuevo, añadirlo al carrito
        return [...currentItems, newItem]
      }
    })

    toast({
      title: "Producto añadido",
      description: `${newItem.name} ha sido añadido al carrito`,
    })
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  // Calcular el número total de items en el carrito
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Calcular el subtotal
  const subtotal = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price * item.quantity, 0)
    return total + itemTotal + extrasTotal
  }, 0)

  // Calcular impuestos (ejemplo: 10%)
  const tax = subtotal * 0.1

  // Calcular total
  const total = subtotal + tax

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        total,
        tax,
        isStoreOpen,
        tenantId,
        setTenantId,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
