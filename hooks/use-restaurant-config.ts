"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { useToast } from "@/components/ui/use-toast"
import { useBranch } from "@/lib/context/branch-context"

export function useRestaurantConfig<T>(
  tenantId: string,
  configSection: string,
  defaultValue: T,
): {
  data: T
  setData: React.Dispatch<React.SetStateAction<T>>
  loading: boolean
  error: string | null
  saveCompleted: (stepId: string) => void
} {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { currentBranch } = useBranch()

  // Cargar datos cuando cambia la sucursal
  useEffect(() => {
    async function loadConfig() {
      // Resetear el estado cuando no hay sucursal seleccionada
      if (!currentBranch) {
        setData(defaultValue)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const config = await getRestaurantConfig(tenantId, currentBranch.id)

        if (config && config[configSection as keyof typeof config]) {
          // Actualizar los datos con la configuración de la sucursal actual
          setData(config[configSection as keyof typeof config] as T)
        } else {
          // Si no hay datos para esta sección, usar los valores por defecto
          setData(defaultValue)
        }
      } catch (err) {
        console.error(`Error al cargar configuración de ${configSection}:`, err)
        setError(`No se pudo cargar la información de ${configSection}`)
        toast({
          title: "Error",
          description: `No se pudo cargar la información de ${configSection}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [tenantId, currentBranch, configSection, defaultValue, toast])

  // Función para marcar un paso como completado
  const saveCompleted = (stepId: string) => {
    if (!currentBranch) return

    const branchKey = `${tenantId}_${currentBranch.id}_completedConfigSteps`
    const completedSteps = JSON.parse(localStorage.getItem(branchKey) || "[]")

    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId)
      localStorage.setItem(branchKey, JSON.stringify(completedSteps))
    }
  }

  return { data, setData, loading, error, saveCompleted }
}
