"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { Checkout } from "./checkout"

export function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const getItemId = (item: any, index: number) => `${item.id}-${index}`

  if (totalItems === 0) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button size="lg" className="rounded-full shadow-lg" disabled>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Carrito (0)
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Botón flotante del carrito */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button size="lg" className="rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
          <ShoppingCart className="h-5 w-5 mr-2" />
          Carrito ({totalItems})
        </Button>
      </div>

      {/* Modal del carrito */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full max-w-md h-[80vh] md:h-auto md:max-h-[80vh] rounded-t-lg md:rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Tu Carrito</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
              {items.map((item, index) => {
                const itemId = getItemId(item, index)
                const itemTotal =
                  (item.price + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)) * item.quantity

                return (
                  <div key={itemId} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg?height=64&width=64&query=food"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>

                      {/* Mostrar extras si los hay */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-1">
                          {item.extras.map((extra) => (
                            <p key={extra.id} className="text-xs text-gray-600">
                              + {extra.name} (+${extra.price.toFixed(2)})
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">${itemTotal.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={() => removeItem(itemId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer con total y botones */}
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    setIsOpen(false)
                    setShowCheckout(true)
                  }}
                >
                  Proceder al Pago
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearCart()
                    setIsOpen(false)
                  }}
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={items}
          totalPrice={totalPrice}
          onOrderComplete={() => {
            clearCart()
            setShowCheckout(false)
          }}
        />
      )}
    </>
  )
}
