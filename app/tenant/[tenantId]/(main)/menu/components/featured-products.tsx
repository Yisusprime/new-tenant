"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

interface FeaturedProductsProps {
  tenantId: string
  branchId: string | null
}

export function FeaturedProducts({ tenantId, branchId }: FeaturedProductsProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeaturedProducts() {
      if (!branchId) return

      try {
        setLoading(true)

        const productsRef = collection(db, `tenants/${tenantId}/branches/${branchId}/products`)
        const productsSnapshot = await getDocs(
          query(productsRef, where("isActive", "==", true), where("isFeatured", "==", true), limit(5)),
        )

        // Si no hay productos destacados, obtener los más populares o recientes
        if (productsSnapshot.empty) {
          const regularProductsSnapshot = await getDocs(query(productsRef, where("isActive", "==", true), limit(5)))

          const productsData = regularProductsSnapshot.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            rank: index + 1,
          }))

          setProducts(productsData)
        } else {
          const productsData = productsSnapshot.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            rank: index + 1,
          }))

          setProducts(productsData)
        }
      } catch (error) {
        console.error("Error al cargar productos destacados:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [tenantId, branchId])

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
      <div className="flex gap-4" style={{ minWidth: "max-content" }}>
        {products.map((product) => (
          <div key={product.id} className="w-40 flex-shrink-0">
            <div className="relative">
              <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg z-10">
                #{product.rank} favorito
              </div>
              <div className="relative h-32 w-full rounded-lg overflow-hidden">
                <Image
                  src={
                    product.image || `/placeholder.svg?height=150&width=150&query=${encodeURIComponent(product.name)}`
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white shadow-md">
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
