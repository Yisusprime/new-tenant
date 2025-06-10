"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface CartExtra {
  id: string
  name: string
  price: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  extras?: CartExtra[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prevItems) => {
      // Crear un ID único que incluya los extras para diferenciar productos con diferentes extras
      const itemKey = `${item.id}-${
        item.extras
          ?.map((e) => e.id)
          .sort()
          .join(",") || "no-extras"
      }`

      const existingItemIndex = prevItems.findIndex((i) => {
        const existingKey = `${i.id}-${
          i.extras
            ?.map((e) => e.id)
            .sort()
            .join(",") || "no-extras"
        }`
        return existingKey === itemKey
      })

      if (existingItemIndex >= 0) {
        // Si el item ya existe (mismo producto con mismos extras), incrementar cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (item.quantity || 1),
        }
        return updatedItems
      } else {
        // Si es un item nuevo, agregarlo
        return [...prevItems, { ...item, quantity: item.quantity || 1 }]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item, index) => `${item.id}-${index}` !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item, index) => (`${item.id}-${index}` === itemId ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => {
    const itemPrice = item.price + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)
    return total + itemPrice * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
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

// Alias para compatibilidad
export const CartContextProvider = CartProvider
