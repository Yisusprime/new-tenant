"use client"

import { useState } from "react"

// Datos de ejemplo para categorías
const sampleCategories = [
  {
    id: "cat1",
    name: "Hamburguesas",
  },
  {
    id: "cat2",
    name: "Pizzas",
  },
  {
    id: "cat3",
    name: "Ensaladas",
  },
  {
    id: "cat4",
    name: "Postres",
  },
  {
    id: "cat5",
    name: "Bebidas",
  },
]

interface DesktopCategoryMenuProps {
  activeCategory: string | null
  onCategoryChange: (categoryId: string) => void
}

export function DesktopCategoryMenu({ activeCategory, onCategoryChange }: DesktopCategoryMenuProps) {
  const [categories, setCategories] = useState(sampleCategories)

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="flex justify-center py-3">
        <div className="flex gap-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeCategory === category.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-700 hover:text-primary"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
