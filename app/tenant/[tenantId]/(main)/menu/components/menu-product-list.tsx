"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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
          query(
            productsRef,
            where("categoryId", "==", categoryId),
            where("isActive", "==", true),
            orderBy("order", "asc"),
          ),
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-24 w-24 rounded-lg" />
          </div>
        ))}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-row h-full">
              <div className="flex-1 p-4">
                <h3 className="font-medium text-lg">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
                  <Button size="sm" variant="ghost" className="rounded-full h-8 w-8 p-0">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="relative w-28 h-28 md:w-32 md:h-32">
                <Image
                  src={product.image || `/placeholder.svg?height=128&width=128&query=food ${product.name}`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
