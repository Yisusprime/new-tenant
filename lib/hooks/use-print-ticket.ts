"use client"

import { useState } from "react"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import type { Order } from "@/lib/types/order"

export function usePrintTicket(tenantId: string, branchId: string) {
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { config } = useRestaurantConfig(tenantId, branchId)

  const openPrintDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsPrintDialogOpen(true)
  }

  const openCommandDialog = (order: Order) => {
    setSelectedOrder(order)
    setIsCommandDialogOpen(true)
  }

  const getRestaurantInfo = () => {
    if (!config) {
      return {
        name: "Restaurante",
        address: "",
        phone: "",
        logo: "",
      }
    }

    const { basicInfo, contactInfo, locationInfo } = config

    return {
      name: basicInfo?.name || "Restaurante",
      address: locationInfo ? `${locationInfo.address || ""}, ${locationInfo.city || ""}` : "",
      phone: contactInfo?.phone || "",
      logo: basicInfo?.logoUrl || "",
    }
  }

  return {
    isPrintDialogOpen,
    setIsPrintDialogOpen,
    isCommandDialogOpen,
    setIsCommandDialogOpen,
    selectedOrder,
    openPrintDialog,
    openCommandDialog,
    restaurantInfo: getRestaurantInfo(),
  }
}
