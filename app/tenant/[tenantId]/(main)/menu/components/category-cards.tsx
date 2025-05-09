"use client"

import { useState } from "react"
import Image from "next/image"

// Datos de ejemplo para categorías
const sampleCategories = [
  {
    id: "cat1",
    name: "Hamburguesas",
    image: "/classic-hamburger.png",
    count: 8,
  },
  {
    id: "cat2",
    name: "Pizzas",
    image: "/delicious-pizza.png",
    count: 12,
  },
  {
    id: "cat3",
    name: "Ensaladas",
    image: "/vibrant-mixed-salad.png",
    count: 6,
  },
  {
    id: "cat4",
    name: "Postres",
    image: "/assorted-desserts.png",
    count: 9,
  },
  {
    id: "cat5",
    name: "Bebidas",
    image: "/assorted-drinks.png",
    count: 10,
  },
]

interface CategoryCardsProps {
  onSelectCategory: (categoryId: string) => void
}

export function CategoryCards({ onSelectCategory }: CategoryCardsProps) {
  const [categories, setCategories] = useState(sampleCategories)

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold mb-3">Explora nuestras categorías</h2>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="flex flex-col items-center"
          >
            <div className="relative h-16 w-16 rounded-full overflow-hidden mb-1 border-2 border-primary">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            </div>
            <span className="text-xs font-medium text-center">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
