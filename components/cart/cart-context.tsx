"use client"

import { useParams } from "next/navigation"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"

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
  tenantId: string
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

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isStoreOpen, setIsStoreOpen] = useState(true) // Default to true for now
  const { toast } = useToast()
  const params = useParams()
  const tenantId =
    typeof params?.tenant === "string" ? params.tenant : Array.isArray(params?.tenant) ? params.tenant[0] : ""

  const [serviceOptions, setServiceOptions] = useState<ServiceOptions>(defaultServiceOptions)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>(defaultPaymentMethods)

  // Añadir tenantId al estado del contexto
  const [tenantIdState, setTenantId] = useState<string>("")

  // Añadir un useEffect para obtener el tenantId
  useEffect(() => {
    // Obtener el tenantId del hostname (subdominio)
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Verificar si estamos en un subdominio
    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      // Extraer el subdominio (tenant)
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      console.log("CartContext - Subdomain detected:", subdomain)
      setTenantId(subdomain)
    }
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  // Add item to cart
  const addItem = (newItem: CartItem) => {
    // Ensure the item has an ID
    const itemToAdd = {
      ...newItem,
      id: newItem.id || uuidv4(),
    }

    setItems((prevItems) => {
      // Check if the product is already in the cart
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.productId === itemToAdd.productId &&
          JSON.stringify(item.extras.map((e) => e.extraId).sort()) ===
            JSON.stringify(itemToAdd.extras.map((e) => e.extraId).sort()),
      )

      if (existingItemIndex >= 0) {
        // If the product exists with the same extras, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += itemToAdd.quantity

        toast({
          title: "Producto actualizado",
          description: `Se actualizó la cantidad de ${itemToAdd.name} en el carrito.`,
        })

        return updatedItems
      } else {
        // If it's a new product, add it to the cart
        toast({
          title: "Producto añadido",
          description: `${itemToAdd.name} se añadió al carrito.`,
        })

        return [...prevItems, itemToAdd]
      }
    })
  }

  // Remove item from cart
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

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  // Update item notes
  const updateItemNotes = (itemId: string, notes: string) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, notes } : item)))
  }

  // Clear cart
  const clearCart = () => {
    setItems([])
    localStorage.removeItem("cart")
  }

  // Calculate total number of items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity
    const extrasTotal = item.extras.reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    return total + itemTotal + extrasTotal * item.quantity
  }, 0)

  // Calculate tax (10%)
  const tax = subtotal * 0.1

  // Calculate total
  const total = subtotal + tax

  // Modificar el valor del contexto para incluir tenantId
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
    tenantId: tenantIdState, // Añadir tenantId al contexto
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
