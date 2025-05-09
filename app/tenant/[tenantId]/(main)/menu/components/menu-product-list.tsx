"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Star } from "lucide-react"
import { motion } from "framer-motion"

interface MenuProductListProps {
  tenantId: string
  branchId: string | null
  categoryId: string
}

export function MenuProductList({ tenantId, branchId, categoryId }: MenuProductListProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      if (!branchId) return

      try {
        setLoading(true)

        const productsRef = collection(db, `tenants/${tenantId}/branches/${branchId}/products`)
        const productsSnapshot = await getDocs(
          query(productsRef, where("categoryId", "==", categoryId), where("isActive", "==", true)),
        )

        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setProducts(productsData)
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [tenantId, branchId, categoryId])

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300 h-full group">
            <CardContent className="p-0 h-full">
              <div className="flex flex-col h-full">
                {/* Imagen del producto */}
                <div className="relative w-full h-40 overflow-hidden">
                  <Image
                    src={
                      product.image || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(product.name)}`
                    }
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isPopular && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-white" />
                      Popular
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                  </div>

                  {product.description && <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>}

                  <Button className="w-full mt-auto" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir al carrito
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
