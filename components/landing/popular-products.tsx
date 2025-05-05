"use client"

import type React from "react"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { useCart } from "@/components/cart/cart-context"
import type { Product } from "@/components/products/product-context"

interface PopularProductsProps {
  products: Product[]
  productButtonColor: string
  buttonTextColor: string
  openProductDetail: (product: Product) => void
  isShiftActive: boolean
}

export function PopularProducts({
  products,
  productButtonColor,
  buttonTextColor,
  openProductDetail,
  isShiftActive,
}: PopularProductsProps) {
  const { toast } = useToast()
  const { addItem } = useCart()

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
    <div className="mt-6 px-4">
      <h2 className="text-xl font-bold mb-4">Más populares</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${!isShiftActive ? "opacity-70" : ""}`}
            onClick={() => openProductDetail(product)}
          >
            <div className="flex h-full md:flex-col">
              <div className="relative h-auto w-1/3 md:w-full md:h-40 flex-shrink-0">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=200&width=300&query=plato+comida"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-3 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm sm:text-base">{product.name}</h3>
                    <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>4.7</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                </div>
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
