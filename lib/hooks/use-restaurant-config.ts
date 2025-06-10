"use client"

import { useState, useEffect } from "react"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"

export function useRestaurantConfig(tenantId: string, branchId: string) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        setError(null)
        const restaurantConfig = await getRestaurantConfig(tenantId, branchId)
        setConfig(restaurantConfig)
      } catch (err) {
        console.error("Error loading restaurant config:", err)
        setError("Error al cargar la configuración del restaurante")
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && branchId) {
      loadConfig()
    }
  }, [tenantId, branchId])

  return { config, loading, error }
}
