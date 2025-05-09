"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
        setError(null)
      } catch (err) {
        console.error("Error al cargar categorías:", err)
        setError("Error al cargar categorías")
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [tenantId, branchId])

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

  if (loading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-gray-500">No hay categorías disponibles</p>
      </div>
    )
  }

  return (
    <div className="py-4 relative">
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
                <Image
                  src={category.imageUrl || "/placeholder.svg?height=64&width=64&query=category"}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
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
