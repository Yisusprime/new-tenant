"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Category } from "@/components/categories/category-context"

interface CategoriesSliderProps {
  categories: Category[]
}

export function CategoriesSlider({ categories }: CategoriesSliderProps) {
  const categoriesSliderRef = useRef<HTMLDivElement>(null)

  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesSliderRef.current) {
      const { scrollLeft, clientWidth } = categoriesSliderRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8

      categoriesSliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  if (categories.length === 0) return null

  return (
    <div className="mt-6">
      <div className="px-4 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Categorías</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scrollCategories("left")}
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scrollCategories("right")}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide gap-4 px-4 pb-4" ref={categoriesSliderRef}>
        {categories.slice(0, 8).map((category) => (
          <Link href={`/admin/menu?category=${category.id}`} key={category.id} className="flex-shrink-0">
            <div className="flex flex-col items-center gap-2 w-14 sm:w-16">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-sm overflow-hidden">
                <Image
                  src={category.imageUrl || "/placeholder.svg?height=80&width=80&query=categoria+comida"}
                  alt={category.name}
                  fill
                  className="object-cover p-2"
                />
              </div>
              <span className="text-xs text-center font-medium">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
