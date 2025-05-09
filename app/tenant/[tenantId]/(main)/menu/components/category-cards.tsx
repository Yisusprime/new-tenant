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
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-4">Categorías</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="group bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative h-32 w-full">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-bold">{category.name}</h3>
                <p className="text-xs">{category.count} productos</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
