"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const [categories] = useState(sampleCategories)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 200
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="py-4 relative">
      <h2 className="text-lg font-bold mb-3">Explora nuestras categorías</h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 py-2 px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="flex flex-col items-center flex-shrink-0"
            >
              <div className="relative h-16 w-16 rounded-full overflow-hidden mb-1 border-2 border-primary">
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
              </div>
              <span className="text-xs font-medium text-center whitespace-nowrap">{category.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
