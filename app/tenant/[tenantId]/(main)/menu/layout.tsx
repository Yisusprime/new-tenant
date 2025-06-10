import type React from "react"
import { CartProvider } from "./context/cart-context"

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </CartProvider>
  )
}
