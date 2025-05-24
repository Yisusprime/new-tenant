"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Minus, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "../context/cart-context"
import { getProductExtras } from "@/lib/services/product-service"

interface ProductExtra {
  id: string
  name: string
  price: number
  description?: string
  isRequired?: boolean
}

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  tenantId: string
  branchId: string | null
}

export function ProductDetailModal({ isOpen, onClose, product, tenantId, branchId }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})
  const [extras, setExtras] = useState<ProductExtra[]>([])
  const [loading, setLoading] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    if (isOpen && product && branchId) {
      loadProductExtras()
    }
  }, [isOpen, product, branchId])

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
    }
  }, [isOpen])

  const loadProductExtras = async () => {
    if (!product || !branchId) return

    try {
      setLoading(true)

      // Si el producto no tiene extras asignados, no mostrar ninguno
      if (!product.availableExtras || product.availableExtras.length === 0) {
        setExtras([])
        setSelectedExtras({})
        return
      }

      // Cargar todos los extras disponibles
      const extrasData = await getProductExtras(tenantId, branchId)

      // Filtrar solo los extras activos Y que estén asignados a este producto
      const productExtras = extrasData.filter(
        (extra: any) => extra.isActive && product.availableExtras?.includes(extra.id),
      )

      setExtras(productExtras)

      // Inicializar el estado de selección solo para los extras del producto
      const initialSelection: Record<string, boolean> = {}
      productExtras.forEach((extra: any) => {
        initialSelection[extra.id] = false
      })
      setSelectedExtras(initialSelection)
    } catch (error) {
      console.error("Error al cargar extras:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [extraId]: !prev[extraId],
    }))
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const calculateTotalPrice = () => {
    if (!product) return 0

    let total = product.discountPrice || product.price

    // Sumar el precio de los extras seleccionados
    Object.entries(selectedExtras).forEach(([extraId, isSelected]) => {
      if (isSelected) {
        const extra = extras.find((e) => e.id === extraId)
        if (extra) {
          total += extra.price
        }
      }
    })

    return total * quantity
  }

  const handleAddToCart = () => {
    if (!product) return

    const selectedExtrasList = extras
      .filter((extra) => selectedExtras[extra.id])
      .map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: extra.price,
      }))

    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.imageUrl,
      quantity,
      extras: selectedExtrasList,
    })

    onClose()
    setQuantity(1)
    setSelectedExtras({})
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-200 ease-out">
        <div className="relative h-64 w-full">
          <Image
            src={product.imageUrl || "/placeholder.svg?height=256&width=512&query=food"}
            alt={product.name}
            fill
            className="object-cover rounded-t-xl"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <h2 className="text-xl font-bold">{product.name}</h2>

          <div className="mt-2 text-lg font-semibold">
            ${(product.discountPrice || product.price).toFixed(2)}
            {product.discountPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
            )}
          </div>

          {product.description && <p className="mt-3 text-gray-600">{product.description}</p>}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Cantidad</h3>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 font-medium">{quantity}</span>
              <Button variant="outline" size="icon" onClick={increaseQuantity} className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : extras.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Agregar extras</h3>
              <div className="space-y-2">
                {extras.map((extra) => (
                  <div key={extra.id} className="flex items-start space-x-2 p-2 border rounded-md">
                    <Checkbox
                      id={`extra-${extra.id}`}
                      checked={selectedExtras[extra.id] || false}
                      onCheckedChange={() => handleExtraToggle(extra.id)}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`extra-${extra.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {extra.name} (+${extra.price.toFixed(2)})
                      </label>
                      {extra.description && <p className="text-xs text-gray-500 mt-1">{extra.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center text-gray-500">
              <p>No hay extras disponibles para este producto</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="text-lg font-bold">${calculateTotalPrice().toFixed(2)}</span>
            </div>
            <Button onClick={handleAddToCart} className="w-full">
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
