import type React from "react"
import { CartProvider } from "@/components/providers/cart-provider"
import { CartContextProvider } from "./context/cart-context"

export default function MenuLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  return (
    <CartProvider>
      <CartContextProvider>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </CartContextProvider>
    </CartProvider>
  )
}
