"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Minus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useCart } from "../context/cart-context"
import type { ProductExtra, ProductExtraOption } from "@/lib/types/products"

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  extras?: ProductExtra[]
}

interface MenuProductListProps {
  products: Product[]
  categoryName: string
}

export function MenuProductList({ products, categoryName }: MenuProductListProps) {
  const { addToCart } = useCart()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, ProductExtraOption[]>>({})
  const [totalPrice, setTotalPrice] = useState(0)

  const handleOpenProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setQuantity(1)

    // Initialize selected extras
    const initialSelectedExtras: Record<string, ProductExtraOption[]> = {}
    if (product.extras && product.extras.length > 0) {
      product.extras.forEach((extra) => {
        // For required extras with default options, preselect them
        if (extra.isRequired) {
          const defaultOptions = extra.options.filter((option) => option.isDefault)
          if (defaultOptions.length > 0) {
            initialSelectedExtras[extra.id] = defaultOptions
          }
        }
      })
    }

    setSelectedExtras(initialSelectedExtras)

    // Calculate initial total price
    calculateTotalPrice(product, initialSelectedExtras)
  }

  const calculateTotalPrice = (product: Product, extrasSelection: Record<string, ProductExtraOption[]>) => {
    let price = product.price

    // Add price of selected extras
    Object.entries(extrasSelection).forEach(([extraId, options]) => {
      const extra = product.extras?.find((e) => e.id === extraId)
      if (extra) {
        // Add base price of the extra
        price += extra.price

        // Add price of each selected option
        options.forEach((option) => {
          price += option.price
        })
      }
    })

    setTotalPrice(price * quantity)
  }

  const handleExtraOptionChange = (
    extraId: string,
    option: ProductExtraOption,
    isChecked: boolean,
    isRadio: boolean,
  ) => {
    if (!selectedProduct) return

    const newSelectedExtras = { ...selectedExtras }

    if (isRadio) {
      // For radio buttons (single selection)
      newSelectedExtras[extraId] = [option]
    } else {
      // For checkboxes (multiple selection)
      const currentOptions = newSelectedExtras[extraId] || []

      if (isChecked) {
        // Add option if it doesn't exist
        if (!currentOptions.some((opt) => opt.id === option.id)) {
          newSelectedExtras[extraId] = [...currentOptions, option]
        }
      } else {
        // Remove option
        newSelectedExtras[extraId] = currentOptions.filter((opt) => opt.id !== option.id)
      }
    }

    setSelectedExtras(newSelectedExtras)
    calculateTotalPrice(selectedProduct, newSelectedExtras)
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    // Format selected extras for cart
    const formattedExtras = Object.entries(selectedExtras).map(([extraId, options]) => {
      const extra = selectedProduct.extras?.find((e) => e.id === extraId)
      return {
        id: extraId,
        name: extra?.name || "",
        options: options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          price: opt.price,
        })),
      }
    })

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: totalPrice / quantity,
      quantity,
      extras: formattedExtras,
      totalPrice: totalPrice,
    })

    // Reset state
    setSelectedProduct(null)
    setQuantity(1)
    setSelectedExtras({})
  }

  const incrementQuantity = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    if (selectedProduct) {
      calculateTotalPrice(selectedProduct, selectedExtras)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1
      setQuantity(newQuantity)
      if (selectedProduct) {
        calculateTotalPrice(selectedProduct, selectedExtras)
      }
    }
  }

  const isExtraValid = (extra: ProductExtra) => {
    const selectedOptions = selectedExtras[extra.id] || []

    if (extra.isRequired && selectedOptions.length === 0) {
      return false
    }

    if (extra.minSelections && selectedOptions.length < extra.minSelections) {
      return false
    }

    if (extra.maxSelections && selectedOptions.length > extra.maxSelections) {
      return false
    }

    return true
  }

  const isFormValid = () => {
    if (!selectedProduct || !selectedProduct.extras) return true

    return selectedProduct.extras.every(isExtraValid)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{categoryName}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex cursor-pointer" onClick={() => handleOpenProductDialog(product)}>
              <div className="flex-1 p-2">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                <p className="mt-2 font-medium">${product.price.toFixed(2)}</p>
                {product.extras && product.extras.length > 0 && (
                  <div className="mt-1 flex items-center text-xs text-muted-foreground">
                    <Info className="mr-1 h-3 w-3" />
                    <span>Personalizable</span>
                  </div>
                )}
              </div>
              {product.imageUrl && (
                <div className="h-24 w-24 overflow-hidden rounded-md">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
            </div>
            <Button
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleOpenProductDialog(product)}
            >
              Agregar
            </Button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>{selectedProduct.description}</DialogDescription>
            </DialogHeader>

            {selectedProduct.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden rounded-md">
                <Image
                  src={selectedProduct.imageUrl || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {selectedProduct.extras && selectedProduct.extras.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {selectedProduct.extras.map((extra) => (
                  <div key={extra.id} className="mb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{extra.name}</h4>
                      {extra.isRequired && <span className="text-xs text-red-500">Requerido</span>}
                    </div>

                    {extra.minSelections && extra.maxSelections && (
                      <p className="text-xs text-muted-foreground">
                        {extra.minSelections === extra.maxSelections
                          ? `Selecciona ${extra.minSelections} opción${extra.minSelections !== 1 ? "es" : ""}`
                          : `Selecciona entre ${extra.minSelections} y ${extra.maxSelections} opciones`}
                      </p>
                    )}

                    <div className="mt-2 space-y-2">
                      {extra.maxSelections === 1 ? (
                        // Radio buttons for single selection
                        <RadioGroup
                          value={selectedExtras[extra.id]?.[0]?.id || ""}
                          onValueChange={(value) => {
                            const option = extra.options.find((opt) => opt.id === value)
                            if (option) {
                              handleExtraOptionChange(extra.id, option, true, true)
                            }
                          }}
                        >
                          {extra.options.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center justify-between space-x-2 rounded-md border p-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                <Label htmlFor={`option-${option.id}`}>{option.name}</Label>
                              </div>
                              {option.price > 0 && <span className="text-sm">+${option.price.toFixed(2)}</span>}
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        // Checkboxes for multiple selection
                        <div className="space-y-2">
                          {extra.options.map((option) => {
                            const isSelected = (selectedExtras[extra.id] || []).some((opt) => opt.id === option.id)

                            return (
                              <div
                                key={option.id}
                                className="flex items-center justify-between space-x-2 rounded-md border p-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`option-${option.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      handleExtraOptionChange(extra.id, option, checked as boolean, false)
                                    }}
                                  />
                                  <Label htmlFor={`option-${option.id}`}>{option.name}</Label>
                                </div>
                                {option.price > 0 && <span className="text-sm">+${option.price.toFixed(2)}</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {!isExtraValid(extra) && (
                      <p className="mt-1 text-xs text-red-500">
                        {extra.isRequired
                          ? "Esta selección es requerida"
                          : extra.minSelections && (selectedExtras[extra.id] || []).length < extra.minSelections
                            ? `Selecciona al menos ${extra.minSelections} opción${extra.minSelections !== 1 ? "es" : ""}`
                            : extra.maxSelections && (selectedExtras[extra.id] || []).length > extra.maxSelections
                              ? `Selecciona máximo ${extra.maxSelections} opción${extra.maxSelections !== 1 ? "es" : ""}`
                              : ""}
                      </p>
                    )}

                    <Separator className="my-3" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span>{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-lg font-semibold">${totalPrice.toFixed(2)}</div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddToCart} disabled={!isFormValid()}>
                Agregar al Carrito
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
