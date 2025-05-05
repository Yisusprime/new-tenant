"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function CartButton() {
  const { itemCount, isStoreOpen } = useCart()
  const router = useRouter()

  const handleClick = () => {
    router.push("/cart")
  }

  return (
    <Button onClick={handleClick} variant="outline" size="icon" className="relative" disabled={!isStoreOpen}>
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {itemCount}
        </Badge>
      )}
    </Button>
  )
}
