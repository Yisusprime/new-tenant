"use client"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import type { OrderItem } from "@/lib/types/order"

interface ProductsStepProps {
  items: OrderItem[]
  setItems: (items: OrderItem[]) => void
  setProductSelectorOpen: (open: boolean) => void
  handleRemoveItem: (itemId: string) => void
  handleUpdateItemQuantity: (itemId: string, quantity: number) => void
  errors: Record<string, string>
}

export function ProductsStep({
  items,
  setItems,
  setProductSelectorOpen,
  handleRemoveItem,
  handleUpdateItemQuantity,
  errors,
}: ProductsStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Productos <span className="text-red-500 ml-1">*</span>
        </h3>
        <Button onClick={() => setProductSelectorOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No hay productos en el pedido</p>
          {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}
          <Button onClick={() => setProductSelectorOpen(true)} variant="link" className="mt-2">
            Agregar Producto
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start border p-4 rounded-md">
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{item.name}</p>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="ml-4 text-sm text-gray-500">{formatCurrency(item.price)} c/u</span>
                </div>
                {item.extras && item.extras.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Extras:</p>
                    <ul className="list-disc list-inside ml-2">
                      {item.extras.map((extra, i) => (
                        <li key={i}>
                          {extra.name} ({formatCurrency(extra.price)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
