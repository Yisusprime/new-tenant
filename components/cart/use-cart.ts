"use client"

import { createContext, useContext } from "react"
import type { CartItem } from "@/lib/types/orders"

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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
