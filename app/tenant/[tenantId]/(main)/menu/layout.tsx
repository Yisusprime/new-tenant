"use client"

import type React from "react"

import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import { useParams } from "next/navigation"

interface MenuLayoutProps {
  children: React.ReactNode
}

export default function MenuLayout({ children }: MenuLayoutProps) {
  const { tenantId } = useParams()
  const { config: restaurantConfig } = useRestaurantConfig(tenantId as string, "default")

  return <>{children}</>
}
