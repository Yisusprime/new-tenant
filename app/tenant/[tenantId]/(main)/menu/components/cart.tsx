"use client"

import { useState, useEffect } from "react"
import { useCart } from "../context/cart-context"
import { ShoppingCart, Minus, Plus, X, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { CheckoutDialog } from "./checkout-dialog"
import { useParams } from "next/navigation"

export function Cart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const params = useParams()

  // Abrir automáticamente el carrito cuando se agrega un producto
  useEffect(() => {
    if (totalItems > 0 && !isOpen) {
      setIsOpen(true)
    }
  }, [totalItems])

  if (totalItems === 0) {
    return null
  }

  return (
    <>
      {/* Carrito para móvil (botón flotante) */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center relative"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        </Button>
      </div>

      {/* Carrito para PC (panel inferior) */}
      <div
        className={`hidden md:block fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white shadow-lg z-40 transition-all duration-300 rounded-t-lg border-l border-r border-t max-w-4xl w-full mx-4 ${
          isMinimized ? "translate-y-[calc(100%-60px)]" : ""
        }`}
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer border-b bg-gray-50 rounded-t-lg"
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

        <div className="max-h-[40vh] overflow-y-auto p-4">
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center py-3 px-4 bg-gray-50 rounded-lg">
                <div className="relative h-14 w-14 rounded-md overflow-hidden mr-4 flex-shrink-0">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 ml-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-medium">Subtotal:</span>
            <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
          </div>
          <Button
            className="w-full h-12 text-base font-medium"
            onClick={() => setCheckoutOpen(true)}
            disabled={totalItems === 0}
          >
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
              {items.map((item) => (
                <div key={item.id} className="flex items-center py-2 border-b last:border-0">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden mr-3">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 w-6 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => setCheckoutOpen(true)} disabled={totalItems === 0}>
                Proceder al pago
              </Button>
            </div>
          </div>
        </div>
      )}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        tenantId={params.tenantId as string}
        branchId="default" // Puedes obtener esto del contexto si tienes múltiples sucursales
      />
    </>
  )
}
