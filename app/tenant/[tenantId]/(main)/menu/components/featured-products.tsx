"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { getProducts } from "@/lib/services/product-service"
import { ProductDetailModal } from "./product-detail-modal"

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

  // Para el arrastre con el mouse
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

  // Para el modal de detalle
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Funciones para el arrastre con el mouse
  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollContainerRef.current) return

    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    setDragStartTime(Date.now())
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return

    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Velocidad de desplazamiento
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false)

    // Si el arrastre duró menos de 150ms y no se movió mucho, considerarlo un clic
    const dragTime = Date.now() - dragStartTime
    const dragDistance = Math.abs(e.pageX - (startX + (scrollContainerRef.current?.offsetLeft || 0)))

    if (dragTime < 150 && dragDistance < 5) {
      // Es un clic, no un arrastre
      return false
    }

    return true
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleProductClick = (product: any, e: MouseEvent) => {
    // Si estamos arrastrando, no abrir el modal
    if (handleMouseUp(e)) return

    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
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
      {/* Controles de navegación en la parte superior */}
      <div className="flex justify-end mb-2 gap-2">
        <button
          onClick={() => scroll("left")}
          className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto scrollbar-hide gap-4 py-2 px-2 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {featuredProducts.map((product, index) => (
          <div key={product.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="relative h-40 w-full rounded-lg overflow-hidden cursor-pointer"
              onClick={(e) => handleProductClick(product, e as unknown as MouseEvent)}
            >
              <Image
                src={product.imageUrl || "/placeholder.svg?height=160&width=256&query=featured food"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />

              {/* Etiqueta para los primeros 3 productos */}
              {index < 3 && (
                <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg z-10">
                  #{index + 1} de tus favoritos
                </div>
              )}
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

      {/* Modal de detalle del producto */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        tenantId={tenantId}
        branchId={branchId}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
