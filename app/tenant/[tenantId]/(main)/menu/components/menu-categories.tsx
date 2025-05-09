"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MenuProductList } from "./menu-product-list"
import { Loader2 } from "lucide-react"

interface MenuCategoriesProps {
  tenantId: string
  branchId: string | null
}

export function MenuCategories({ tenantId, branchId }: MenuCategoriesProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      if (!branchId) return

      try {
        setLoading(true)

        const categoriesRef = collection(db, `tenants/${tenantId}/branches/${branchId}/categories`)
        const categoriesSnapshot = await getDocs(query(categoriesRef, where("isActive", "==", true)))

        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setCategories(categoriesData)

        // Establecer la primera categoría como activa
        if (categoriesData.length > 0 && !activeCategory) {
          setActiveCategory(categoriesData[0].id)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, branchId, activeCategory])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay categorías, mostrar mensaje
  if (categories.length === 0) {
    return (
      <div className="px-4 md:px-6 py-12 max-w-5xl mx-auto">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 mt-4 pb-16 md:pb-0 max-w-5xl mx-auto">
      <Tabs value={activeCategory || undefined} onValueChange={setActiveCategory} className="w-full">
        <div className="border-b sticky top-0 bg-white z-10 pb-2">
          <TabsList className="w-full h-auto flex overflow-x-auto py-1 justify-start bg-transparent">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-4 py-2 whitespace-nowrap rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <h2 className="text-xl font-bold mb-4">{category.name}</h2>
            {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}

            <MenuProductList tenantId={tenantId} branchId={branchId} categoryId={category.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
