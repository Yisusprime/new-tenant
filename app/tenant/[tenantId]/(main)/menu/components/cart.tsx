"use client"

import { useCart, type CartItem } from "../context/cart-context"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"

export function Cart() {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, isCartOpen, setIsCartOpen } = useCart()

  if (totalItems === 0) {
    return null
  }

  return (
    <>
      {/* Botón flotante del carrito en móvil */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Button onClick={() => setIsCartOpen(true)} size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      </div>

      {/* Carrito en la parte inferior en desktop */}
      <div className="hidden md:block sticky bottom-0 left-0 right-0 bg-white border-t shadow-md z-40">
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingBag className="h-6 w-6" />
              <span className="font-medium">
                {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
              </span>
              <span className="text-gray-500">|</span>
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
            </div>
            <Button onClick={() => setIsCartOpen(true)}>Ver carrito</Button>
          </div>
        </div>
      </div>

      {/* Panel deslizable del carrito */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Tu carrito</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-auto py-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="lg">
                Proceder al pago
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-3 border-b pb-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.image || `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.name)}`}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="font-medium">{item.name}</h3>
          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-1">${item.price.toFixed(2)}</p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-2 text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
