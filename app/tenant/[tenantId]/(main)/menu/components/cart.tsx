"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Plus, Minus, X, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { Checkout } from "./checkout"

export function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const getItemId = (item: any, index: number) => `${item.id}-${index}`

  if (totalItems === 0) {
    return null
  }

  return (
    <>
      {/* Carrito para móvil (botón flotante) */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center relative bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      </div>

      {/* Carrito para PC (panel inferior) */}
      <div
        className={`hidden md:block fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 transition-transform duration-300 ${
          isMinimized ? "transform translate-y-[calc(100%-60px)]" : ""
        }`}
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer border-b"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            <span className="font-bold">Tu pedido ({totalItems} productos)</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-2">${totalPrice.toFixed(2)}</span>
            <ChevronUp className={`h-5 w-5 transition-transform ${isMinimized ? "" : "transform rotate-180"}`} />
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4">
          {items.map((item, index) => {
            const itemId = getItemId(item, index)
            const itemTotal =
              (item.price + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)) * item.quantity

            return (
              <div key={itemId} className="flex items-center py-2 border-b last:border-0">
                <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  {item.extras && item.extras.length > 0 && (
                    <div className="mt-1">
                      {item.extras.map((extra) => (
                        <p key={extra.id} className="text-xs text-gray-500">
                          + {extra.name} (+${extra.price.toFixed(2)})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2 w-6 text-center">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 ml-2" onClick={() => removeItem(itemId)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Button className="w-full" onClick={() => setShowCheckout(true)}>
            Proceder al pago
          </Button>
        </div>
      </div>

      {/* Modal de carrito para móvil */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Tu pedido ({totalItems})</h3>
              <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4">
              {items.map((item, index) => {
                const itemId = getItemId(item, index)
                const itemTotal =
                  (item.price + (item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0)) * item.quantity

                return (
                  <div key={itemId} className="flex items-center py-2 border-b last:border-0">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                      {item.extras && item.extras.length > 0 && (
                        <div className="mt-1">
                          {item.extras.map((extra) => (
                            <p key={extra.id} className="text-xs text-gray-500">
                              + {extra.name} (+${extra.price.toFixed(2)})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2 w-6 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setIsOpen(false)
                  setShowCheckout(true)
                }}
              >
                Proceder al pago
              </Button>
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
