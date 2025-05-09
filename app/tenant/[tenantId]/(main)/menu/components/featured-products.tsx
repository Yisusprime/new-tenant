"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { getProducts } from "@/lib/services/product-service"

interface FeaturedProductsProps {
  tenantId: string
  branchId: string | null
}

export function FeaturedProducts({ tenantId, branchId }: FeaturedProductsProps) {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadFeaturedProducts() {
      if (!branchId) {
        setLoading(false)
        setError("No se ha seleccionado una sucursal")
        return
      }

      try {
        setLoading(true)
        const productsData = await getProducts(tenantId, branchId)
        // Filtrar solo productos destacados y activos
        const featured = productsData.filter((product) => product.isFeatured && product.isActive)
        setFeaturedProducts(featured)
        setError(null)
      } catch (err) {
        console.error("Error al cargar productos destacados:", err)
        setError("Error al cargar productos destacados")
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [tenantId, branchId])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 300
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (featuredProducts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No hay productos destacados disponibles</p>
      </div>
    )
  }

  return (
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
        {featuredProducts.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative h-40 w-full rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl || "/placeholder.svg?height=160&width=256&query=featured food"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              {product.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>}
              <div className="flex justify-between items-center mt-2">
                <p className="font-bold text-sm">
                  ${product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}
                  {product.discountPrice && (
                    <span className="text-xs text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                  )}
                </p>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.discountPrice || product.price,
                      image: product.imageUrl,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
        aria-label="Desplazar a la derecha"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
