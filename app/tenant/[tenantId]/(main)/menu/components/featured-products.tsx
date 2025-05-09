"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Image from "next/image"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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
          query(
            productsRef,
            where("isActive", "==", true),
            where("featured", "==", true),
            orderBy("price", "desc"),
            limit(3),
          ),
        )

        // If no featured products, get any products
        if (productsSnapshot.empty) {
          const allProductsSnapshot = await getDocs(query(productsRef, where("isActive", "==", true), limit(3)))

          const productsData = allProductsSnapshot.docs.map((doc, index) => ({
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
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Artículos destacados</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                #{product.rank} de tus favoritos
              </span>
            </div>
            <div className="border rounded-lg overflow-hidden relative">
              <div className="relative h-40 w-full">
                <Image
                  src={product.image || "/placeholder.svg?height=200&width=400&query=food"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-lg">{product.name}</h3>
                <p className="font-semibold mt-1">CLP {product.price.toLocaleString()}</p>
              </div>
              <Button size="icon" className="absolute bottom-3 right-3 rounded-full h-10 w-10 shadow-md">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
