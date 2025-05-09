"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useCart } from "../context/cart-context"

// Datos de ejemplo para productos destacados
const sampleProducts = [
  {
    id: "prod1",
    name: "Hamburguesa Clásica",
    price: 8.99,
    image: "/default.png",
    rank: 1,
  },
  {
    id: "prod2",
    name: "Pizza Margherita",
    price: 12.99,
    image: "/default.png",
    rank: 2,
  },
  {
    id: "prod3",
    name: "Ensalada César",
    price: 7.5,
    image: "/default.png",
    rank: 3,
  },
  {
    id: "prod4",
    name: "Pasta Carbonara",
    price: 10.99,
    image: "/default.png",
    rank: 4,
  },
  {
    id: "prod5",
    name: "Taco de Pollo",
    price: 6.99,
    image: "/default.png",
    rank: 5,
  },
]

interface FeaturedProductsProps {
  tenantId: string
  branchId: string | null
}

export function FeaturedProducts({ tenantId, branchId }: FeaturedProductsProps) {
  const [products, setProducts] = useState(sampleProducts)
  const [loading, setLoading] = useState(false)
  const { addItem } = useCart()

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 px-1" style={{ minWidth: "max-content" }}>
        {products.map((product) => (
          <div key={product.id} className="w-40 flex-shrink-0">
            <div className="relative">
              <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg z-10">
                #{product.rank} de tus favoritos
              </div>
              <div className="relative h-32 w-full rounded-lg overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white shadow-md"
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <h3 className="font-medium text-sm mt-2 line-clamp-2">{product.name}</h3>
            <p className="text-sm font-bold">${product.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
