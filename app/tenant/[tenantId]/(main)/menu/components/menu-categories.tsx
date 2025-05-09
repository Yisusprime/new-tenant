"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuProductList } from "./menu-product-list"
import { getCategories } from "@/lib/services/category-service"
import { Loader2 } from "lucide-react"

interface MenuCategoriesProps {
  tenantId: string
  branchId: string | null
  activeCategory: string | null
  onCategoryChange: (categoryId: string) => void
  showMobileMenu?: boolean
}

export function MenuCategories({
  tenantId,
  branchId,
  activeCategory,
  onCategoryChange,
  showMobileMenu = false,
}: MenuCategoriesProps) {
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

        // Si no hay categoría activa y hay categorías disponibles, seleccionar la primera
        if (!activeCategory && activeCategories.length > 0) {
          onCategoryChange(activeCategories[0].id)
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
  }, [tenantId, branchId, activeCategory, onCategoryChange])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay categorías disponibles</p>
      </div>
    )
  }

  return (
    <Tabs value={activeCategory || categories[0]?.id} onValueChange={onCategoryChange} className="w-full">
      <div className="sticky top-0 bg-white z-20 shadow-sm">
        <TabsList className="h-auto p-1 w-full overflow-x-auto flex flex-nowrap justify-start md:justify-center">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="px-4 py-2 whitespace-nowrap">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <div className="min-h-[200px]">
        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="p-4">
            <h2 className="text-xl font-bold mb-4">{category.name}</h2>
            <MenuProductList tenantId={tenantId} branchId={branchId} categoryId={category.id} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
