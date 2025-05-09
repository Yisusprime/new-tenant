"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { getProductsByCategory } from "@/lib/services/product-service"
import { ProductDetailModal } from "./product-detail-modal"

interface MenuProductListProps {
  tenantId: string
  branchId: string | null
  categoryId: string
}

export function MenuProductList({ tenantId, branchId, categoryId }: MenuProductListProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  // Para el modal de detalle
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      if (!branchId) {
        setLoading(false)
        setError("No se ha seleccionado una sucursal")
        return
      }

      if (!categoryId) {
        setLoading(false)
        setError("No se ha seleccionado una categoría")
        return
      }

      try {
        setLoading(true)
        const productsData = await getProductsByCategory(tenantId, branchId, categoryId)
        // Filtrar solo productos activos
        const activeProducts = productsData.filter((product) => product.isActive)
        setProducts(activeProducts)
        setError(null)
      } catch (err) {
        console.error("Error al cargar productos:", err)
        setError("Error al cargar productos")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [tenantId, branchId, categoryId])

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 min-h-[200px]">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  // Si no hay productos, mostrar mensaje
  if (products.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg min-h-[200px]">
        <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative h-32 md:h-48 w-full cursor-pointer" onClick={() => handleProductClick(product)}>
              <Image
                src={product.imageUrl || "/placeholder.svg?height=192&width=256&query=food"}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="p-3 md:p-4">
              <h3 className="font-medium text-sm md:text-lg line-clamp-1">{product.name}</h3>
              {product.description && (
                <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
              )}
              <div className="flex justify-between items-center mt-2 md:mt-4">
                <p className="font-bold text-sm md:text-base">
                  ${product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}
                  {product.discountPrice && (
                    <span className="text-xs text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                  )}
                </p>
                <Button
                  size="sm"
                  className="h-8 w-8 md:h-9 md:w-9 p-0 rounded-full"
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.discountPrice || product.price,
                      image: product.imageUrl,
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

      {/* Modal de detalle del producto */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        tenantId={tenantId}
        branchId={branchId}
      />
    </>
  )
}
