"use client"

import type React from "react"

import { CartProvider } from "@/components/cart/cart-context"
import { useAuth } from "@/lib/auth-context"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const tenantId = user?.tenantId || ""

  return <CartProvider tenantId={tenantId}>{children}</CartProvider>
}
