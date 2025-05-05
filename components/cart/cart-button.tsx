"use client"

import { useCart } from "@/components/cart/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

export function CartButton() {
  const { itemCount } = useCart()
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={() => router.push("/cart")}
      aria-label={`Carrito de compras, ${itemCount} productos`}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  )
}
