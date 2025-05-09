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
    let isMounted = true

    async function loadConfig() {
      // Si no hay sucursal seleccionada, no intentamos cargar datos
      if (!currentBranch) {
        if (isMounted) {
          setData(defaultValue)
          setLoading(false)
          setError(null)
        }
        return
      }

      try {
        if (isMounted) {
          setLoading(true)
          setError(null)
        }

        console.log(`Cargando configuración para sucursal ${currentBranch.id}, sección ${configSection}`)
        const config = await getRestaurantConfig(tenantId, currentBranch.id)

        // Solo actualizamos el estado si el componente sigue montado
        if (!isMounted) return

        if (config && config[configSection as keyof typeof config]) {
          // Actualizar los datos con la configuración de la sucursal actual
          setData(config[configSection as keyof typeof config] as T)
          console.log(`Datos cargados para sección ${configSection}:`, config[configSection as keyof typeof config])
        } else {
          // Si no hay datos para esta sección, usar los valores por defecto
          setData(defaultValue)
          console.log(`No hay datos para sección ${configSection}, usando valores por defecto`)
        }
      } catch (err) {
        console.error(`Error al cargar configuración de ${configSection}:`, err)

        if (isMounted) {
          setError(`No se pudo cargar la información de ${configSection}`)
          // No mostramos toast aquí para evitar múltiples notificaciones
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadConfig()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
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
