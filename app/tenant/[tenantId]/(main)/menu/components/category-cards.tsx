"use client"

import { useState, useEffect } from "react"
import { getCategories } from "@/lib/services/category-service"

interface CategoryCardsProps {
  tenantId: string
  branchId: string | null
  onSelectCategory: (categoryId: string) => void
}

export function CategoryCards({ tenantId, branchId, onSelectCategory }: CategoryCardsProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      if (!branchId) {
        setLoading(false)
        setError("No se ha seleccionado una sucursal")
        return
      }

      try {
        setLoading(true)
        const categoriesData = await getCategories(tenantId, branchId)
        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter((cat) => cat.isActive)
        setCategories(activeCategories)

        // Si hay categorías, seleccionar la primera automáticamente
        if (activeCategories.length > 0) {
          onSelectCategory(activeCategories[0].id)
        }

        setError(null)
      } catch (err) {
        console.error("Error al cargar categorías:", err)
        setError("Error al cargar categorías")
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, branchId, onSelectCategory])

  // No renderizamos nada visualmente, solo cargamos las categorías
  // y seleccionamos la primera automáticamente
  if (loading || error || categories.length === 0) {
    return null
  }

  return null
}
