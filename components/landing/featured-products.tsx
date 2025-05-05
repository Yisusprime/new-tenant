"use client"

import type React from "react"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { useCart } from "@/components/cart/cart-context"
import type { Product } from "@/components/products/product-context"

interface FeaturedProductsProps {
  products: Product[]
  productButtonColor: string
  buttonTextColor: string
  openProductDetail: (product: Product) => void
  isShiftActive: boolean
}

export function FeaturedProducts({
  products,
  productButtonColor,
  buttonTextColor,
  openProductDetail,
  isShiftActive,
}: FeaturedProductsProps) {
  const featuredSliderRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { addItem } = useCart()

  const scrollFeatured = (direction: "left" | "right") => {
    if (featuredSliderRef.current) {
      const { scrollLeft, clientWidth } = featuredSliderRef.current
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8

      featuredSliderRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      })
    }
  }

  // Función para añadir un producto al carrito
  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isShiftActive) {
      toast({
        title: "Restaurante cerrado",
        description: "Lo sentimos, el restaurante no está atendiendo en este momento.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.imageUrl,
      extras: [],
    })
  }

  if (products.length === 0) return null

  return (
    <div className="mt-6">
      <div className="px-4 flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Destacados</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => scrollFeatured("left")}>
            <ChevronLeft size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scrollFeatured("right")}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 px-4 pb-4"
        ref={featuredSliderRef}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[220px] sm:w-[250px] md:w-[280px] snap-start cursor-pointer"
            onClick={() => openProductDetail(product)}
          >
            <Card
              className={`overflow-hidden h-full hover:shadow-md transition-shadow ${!isShiftActive ? "opacity-70" : ""}`}
            >
              <div className="relative h-32 sm:h-36 md:h-40">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast({
                      title: "Añadido a favoritos",
                      description: `${product.name} ha sido añadido a tus favoritos`,
                    })
                  }}
                >
                  <Heart size={16} />
                </Button>
              </div>
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm sm:text-base">{product.name}</h3>
                  <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm sm:text-base">${product.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    className={`h-7 sm:h-8 text-xs sm:text-sm rounded-full ${!isShiftActive ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: productButtonColor,
                      color: buttonTextColor,
                    }}
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!isShiftActive}
                  >
                    Añadir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
