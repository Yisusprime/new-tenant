"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Star, Share2, Heart, ShoppingCart, Plus, Minus, Facebook, Twitter, Instagram, LinkIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Product, Extra } from "@/components/products/product-context"
import { toast } from "@/components/ui/use-toast"

interface ProductDetailModalProps {
  product: Product | null
  extras: Extra[]
  isOpen: boolean
  onClose: () => void
  buttonColor: string
  buttonTextColor: string
}

export function ProductDetailModal({
  product,
  extras,
  isOpen,
  onClose,
  buttonColor,
  buttonTextColor,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({})
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  if (!product) return null

  // Filtrar los extras disponibles para este producto
  const availableExtras = extras.filter(
    (extra) => extra.available && product.productExtras && product.productExtras[extra.id],
  )

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras((prev) => ({
      ...prev,
      [extraId]: !prev[extraId],
    }))
  }

  const handleAddToCart = () => {
    // Aquí iría la lógica para añadir al carrito
    const selectedExtrasList = Object.entries(selectedExtras)
      .filter(([_, isSelected]) => isSelected)
      .map(([extraId]) => extraId)

    toast({
      title: "Producto añadido al carrito",
      description: `${quantity} x ${product.name} con ${selectedExtrasList.length} extras`,
    })

    onClose()
    setQuantity(1)
    setSelectedExtras({})
  }

  const handleSubmitReview = () => {
    // Aquí iría la lógica para enviar la valoración
    toast({
      title: "Valoración enviada",
      description: `Has valorado ${product.name} con ${rating} estrellas`,
    })

    setShowReviewForm(false)
    setRating(0)
    setComment("")
  }

  const handleShare = (platform: string) => {
    // Simulación de compartir en redes sociales
    toast({
      title: "Compartido",
      description: `Producto compartido en ${platform}`,
    })
    setShareOpen(false)
  }

  // Calcular el precio total con extras
  const calculateTotalPrice = () => {
    let total = product.price * quantity

    // Añadir el precio de los extras seleccionados
    Object.entries(selectedExtras).forEach(([extraId, isSelected]) => {
      if (isSelected && product.productExtras[extraId]) {
        const extraPrice = product.productExtras[extraId].price || extras.find((e) => e.id === extraId)?.price || 0
        total += extraPrice * quantity
      }
    })

    return total.toFixed(2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
            <div className="flex items-center gap-2">
              {/* Botón de compartir */}
              <Popover open={shareOpen} onOpenChange={setShareOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 size={18} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => handleShare("Facebook")}
                    >
                      <Facebook size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-sky-500 text-white hover:bg-sky-600"
                      onClick={() => handleShare("Twitter")}
                    >
                      <Twitter size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-pink-500 text-white hover:bg-pink-600"
                      onClick={() => handleShare("Instagram")}
                    >
                      <Instagram size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`Mira este producto: ${product.name}`)
                        toast({
                          title: "Enlace copiado",
                          description: "Enlace copiado al portapapeles",
                        })
                      }}
                    >
                      <LinkIcon size={18} />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Botón de favorito */}
              <Button variant="ghost" size="icon" className="rounded-full">
                <Heart size={18} />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                onClick={() => {
                  setShowReviewForm(true)
                  setRating(star)
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
            <span className="text-sm ml-1">4.0</span>
            <span className="text-xs text-muted-foreground ml-1">(24 valoraciones)</span>
          </div>
        </DialogHeader>

        {/* Imagen del producto */}
        <div className="relative h-56 w-full rounded-lg overflow-hidden my-2">
          <Image
            src={product.imageUrl || "/placeholder.svg?height=300&width=500&query=plato+comida"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Descripción */}
        <DialogDescription className="text-sm">
          {product.description || "Sin descripción disponible."}
        </DialogDescription>

        <Separator className="my-4" />

        {/* Formulario de valoración */}
        {showReviewForm && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`cursor-pointer ${
                    star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Escribe tu comentario sobre este producto..."
              className="mb-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowReviewForm(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitReview}
                disabled={rating === 0}
                style={{
                  backgroundColor: buttonColor,
                  color: buttonTextColor,
                }}
              >
                Enviar valoración
              </Button>
            </div>
          </div>
        )}

        {/* Extras */}
        {availableExtras.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Extras</h3>
            <div className="space-y-2">
              {availableExtras.map((extra) => {
                const productExtra = product.productExtras[extra.id]
                const price = productExtra.price !== undefined ? productExtra.price : extra.price
                const isRequired = productExtra.required
                const isIncluded = productExtra.included

                return (
                  <div key={extra.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`extra-${extra.id}`}
                        checked={isIncluded || selectedExtras[extra.id] || false}
                        onCheckedChange={() => handleExtraToggle(extra.id)}
                        disabled={isRequired || isIncluded}
                      />
                      <Label htmlFor={`extra-${extra.id}`} className={`text-sm ${isRequired ? "font-medium" : ""}`}>
                        {extra.name}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                        {isIncluded && <span className="text-green-500 ml-1">(incluido)</span>}
                      </Label>
                    </div>
                    {price > 0 && !isIncluded && <span className="text-sm font-medium">+${price.toFixed(2)}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Cantidad y precio */}
        <div className="flex justify-between items-center">
          <div className="flex items-center border rounded-full overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus size={16} />
            </Button>
          </div>
          <div className="text-xl font-bold">${calculateTotalPrice()}</div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            className="w-full"
            onClick={handleAddToCart}
            style={{
              backgroundColor: buttonColor,
              color: buttonTextColor,
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
