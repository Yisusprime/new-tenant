"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"

// Datos de ejemplo para productos por categoría
const sampleProductsByCategory = {
  cat1: [
    {
      id: "burger1",
      name: "Hamburguesa Clásica",
      price: 8.99,
      description: "Carne de res, lechuga, tomate, cebolla, queso y salsa especial",
      image: "/classic-hamburger.png",
    },
    {
      id: "burger2",
      name: "Hamburguesa con Queso",
      price: 9.99,
      description: "Doble carne, doble queso, cebolla caramelizada y salsa BBQ",
      image: "/cheeseburger.png",
    },
    {
      id: "burger3",
      name: "Hamburguesa Vegetariana",
      price: 7.99,
      description: "Hamburguesa de lentejas, aguacate, rúcula y salsa de yogur",
      image: "/vegetarian-burger.png",
    },
  ],
  cat2: [
    {
      id: "pizza1",
      name: "Pizza Margherita",
      price: 12.99,
      description: "Salsa de tomate, mozzarella y albahaca fresca",
      image: "/pizza-margherita.png",
    },
    {
      id: "pizza2",
      name: "Pizza Pepperoni",
      price: 14.99,
      description: "Salsa de tomate, mozzarella y pepperoni",
      image: "/pepperoni-pizza.png",
    },
  ],
  cat3: [
    {
      id: "salad1",
      name: "Ensalada César",
      price: 7.5,
      description: "Lechuga romana, crutones, queso parmesano y aderezo César",
      image: "/ensalada-cesar.png",
    },
    {
      id: "salad2",
      name: "Ensalada Griega",
      price: 8.5,
      description: "Tomate, pepino, cebolla, aceitunas, queso feta y aderezo de limón",
      image: "/ensalada-griega.png",
    },
  ],
  cat4: [
    {
      id: "dessert1",
      name: "Tarta de Chocolate",
      price: 5.99,
      description: "Tarta de chocolate con base de galleta y cobertura de ganache",
      image: "/chocolate-cake.png",
    },
    {
      id: "dessert2",
      name: "Helado de Vainilla",
      price: 3.99,
      description: "Helado cremoso de vainilla con sirope de chocolate",
      image: "/placeholder.svg?height=200&width=200&query=helado de vainilla",
    },
  ],
  cat5: [
    {
      id: "drink1",
      name: "Refresco de Cola",
      price: 2.5,
      description: "Refresco de cola con hielo",
      image: "/placeholder.svg?height=200&width=200&query=refresco de cola",
    },
    {
      id: "drink2",
      name: "Limonada Casera",
      price: 3.5,
      description: "Limonada fresca con menta y azúcar",
      image: "/placeholder.svg?height=200&width=200&query=limonada casera",
    },
  ],
}

interface MenuProductListProps {
  tenantId: string
  branchId: string | null
  categoryId: string
}

export function MenuProductList({ tenantId, branchId, categoryId }: MenuProductListProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    // Simulamos la carga de productos desde la base de datos
    setLoading(true)
    setTimeout(() => {
      setProducts(sampleProductsByCategory[categoryId as keyof typeof sampleProductsByCategory] || [])
      setLoading(false)
    }, 500)
  }, [categoryId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  // Si no hay productos, mostrar mensaje
  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <div className="relative h-32 md:h-48 w-full">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>
          <div className="p-3 md:p-4">
            <h3 className="font-medium text-sm md:text-lg line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
            )}
            <div className="flex justify-between items-center mt-2 md:mt-4">
              <p className="font-bold text-sm md:text-base">${product.price.toFixed(2)}</p>
              <Button
                size="sm"
                className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-full"
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
