"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Product } from "@/types"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface ProductDetailModalProps {
  product: Product
}

export function ProductDetailModal({ product }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const calculateTotalPrice = () => {
    const basePrice = product.discountPrice || product.price
    let extrasPrice = 0

    if (product.extras) {
      selectedExtras.forEach((extraId) => {
        const extra = product.extras?.find((e) => e.id === extraId)
        if (extra) {
          extrasPrice += extra.price
        }
      })
    }

    return (basePrice + extrasPrice) * quantity
  }

  const handleExtraClick = (extraId: string) => {
    setSelectedExtras((prev) => {
      if (prev.includes(extraId)) {
        return prev.filter((id) => id !== extraId)
      } else {
        return [...prev, extraId]
      }
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ver Detalles</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.description}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right text-sm font-medium">
              Cantidad
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
              className="col-span-3 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="mt-2 text-lg font-semibold">
            {formatCurrency(product.discountPrice || product.price, "CLP")}
            {product.discountPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{formatCurrency(product.price, "CLP")}</span>
            )}
          </div>

          {product.extras && product.extras.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Extras:</h3>
              <div className="mt-2 space-y-1">
                {product.extras.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => handleExtraClick(extra.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      selectedExtras.includes(extra.id) ? "bg-gray-100" : ""
                    }`}
                  >
                    {extra.name} (+{formatCurrency(extra.price, "CLP")})
                    <input
                      type="checkbox"
                      checked={selectedExtras.includes(extra.id)}
                      readOnly
                      className="ml-2 h-4 w-4"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">Total:</span>
            <span className="text-lg font-bold">{formatCurrency(calculateTotalPrice(), "CLP")}</span>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full">Agregar al Carrito</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción agregará {quantity} {product.name} al carrito.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
