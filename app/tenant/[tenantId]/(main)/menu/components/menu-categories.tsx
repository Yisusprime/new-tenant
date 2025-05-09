"use client"

import { useState } from "react"
import { MenuProductList } from "./menu-product-list"
import { Loader2 } from "lucide-react"

// Datos de ejemplo para categorías
const sampleCategories = [
  {
    id: "cat1",
    name: "Hamburguesas",
    description: "Las mejores hamburguesas de la ciudad",
  },
  {
    id: "cat2",
    name: "Pizzas",
    description: "Pizzas artesanales con ingredientes frescos",
  },
  {
    id: "cat3",
    name: "Ensaladas",
    description: "Ensaladas frescas y saludables",
  },
  {
    id: "cat4",
    name: "Postres",
    description: "Deliciosos postres caseros",
  },
  {
    id: "cat5",
    name: "Bebidas",
    description: "Refrescantes bebidas para acompañar tu comida",
  },
]

interface MenuCategoriesProps {
  tenantId: string
  branchId: string | null
  activeCategory: string | null
  onCategoryChange: (categoryId: string) => void
}

export function MenuCategories({ tenantId, branchId, activeCategory, onCategoryChange }: MenuCategoriesProps) {
  const [categories, setCategories] = useState(sampleCategories)
  const [loading, setLoading] = useState(false)

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
      {/* Navegación de categorías solo para móvil */}
      <div className="md:hidden sticky top-0 bg-white z-10 border-b">
        <div className="overflow-x-auto">
          <div className="flex whitespace-nowrap py-3 px-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
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
