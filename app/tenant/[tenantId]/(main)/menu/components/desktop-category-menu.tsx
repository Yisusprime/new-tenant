"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCategories } from "@/lib/services/category-service"

interface DesktopCategoryMenuProps {
  activeCategory: string | null
  onCategoryChange: (categoryId: string) => void
  tenantId: string
  branchId: string | null
}

export function DesktopCategoryMenu({
  activeCategory,
  onCategoryChange,
  tenantId,
  branchId,
}: DesktopCategoryMenuProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      if (!tenantId || !branchId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const categoriesData = await getCategories(tenantId, branchId)
        // Filtrar solo categorías activas
        const activeCategories = categoriesData.filter((cat) => cat.isActive)
        setCategories(activeCategories)

        // Si no hay categoría activa y hay categorías disponibles, seleccionar la primera
        if (!activeCategory && activeCategories.length > 0) {
          onCategoryChange(activeCategories[0].id)
        }
      } catch (err) {
        console.error("Error al cargar categorías:", err)
      } finally {
        setLoading(false)
      }
    }

    if (tenantId && branchId) {
      loadCategories()
    }
  }, [tenantId, branchId, activeCategory, onCategoryChange])

  // Si está cargando o no hay categorías, no mostramos nada
  if (loading || categories.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-2 rounded-md shadow-sm">
      <Tabs value={activeCategory || categories[0]?.id} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="h-auto p-1 w-full flex justify-center">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="px-4 py-2">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
