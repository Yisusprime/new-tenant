"use client"

import type React from "react"

import { CartProvider } from "./context/cart-context"
import { RestaurantStatusProvider } from "@/lib/context/restaurant-status-context"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import { useParams } from "next/navigation"

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const tenantId = params.tenantId as string
  const { restaurantConfig } = useRestaurantConfig(tenantId)

  return (
    <RestaurantStatusProvider tenantId={tenantId} restaurantConfig={restaurantConfig}>
      <CartProvider>{children}</CartProvider>
    </RestaurantStatusProvider>
  )
}
