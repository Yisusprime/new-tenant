"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
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
      <div className="py-12 px-4">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay categorías disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Navegación de categorías */}
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="overflow-x-auto">
          <div className="flex whitespace-nowrap py-3 px-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mostrar productos de la categoría activa */}
      {activeCategory && (
        <div className="px-4 py-4">
          {categories
            .filter((category) => category.id === activeCategory)
            .map((category) => (
              <div key={category.id}>
                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}
                <MenuProductList tenantId={tenantId} branchId={branchId} categoryId={category.id} />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
