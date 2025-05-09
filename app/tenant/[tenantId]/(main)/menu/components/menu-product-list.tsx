"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import Image from "next/image"
import { Loader2, Plus } from "lucide-react"
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
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex border-b pb-4 mb-4 last:border-0">
          <div className="flex-grow pr-4">
            <h3 className="font-medium">{product.name}</h3>
            {product.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>}
            <p className="font-bold mt-2">${product.price.toFixed(2)}</p>
          </div>

          <div className="relative min-w-[90px] h-[90px] bg-gray-50 rounded-lg">
            <Image
              src={product.image || `/placeholder.svg?height=100&width=100&query=${encodeURIComponent(product.name)}`}
              alt={product.name}
              fill
              className="object-contain p-1 rounded-lg"
            />
            <Button size="icon" className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white shadow-md">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
