"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Search, ShoppingBag, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function MobileNavigation() {
  const [activeItem, setActiveItem] = useState("home")
  const [cartCount, setCartCount] = useState(3) // Example cart count

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {/* Inicio */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5"
          onClick={() => setActiveItem("home")}
        >
          <Home className={`h-5 w-5 ${activeItem === "home" ? "text-primary" : "text-gray-500"}`} />
          <span className={`text-xs mt-1 ${activeItem === "home" ? "text-primary font-medium" : "text-gray-500"}`}>
            Inicio
          </span>
        </Link>

        {/* Buscar */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5"
          onClick={() => setActiveItem("search")}
        >
          <Search className={`h-5 w-5 ${activeItem === "search" ? "text-primary" : "text-gray-500"}`} />
          <span className={`text-xs mt-1 ${activeItem === "search" ? "text-primary font-medium" : "text-gray-500"}`}>
            Buscar
          </span>
        </Link>

        {/* Botón central + */}
        <div className="w-1/5 flex justify-center -mt-5">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setActiveItem("add")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Carrito */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5 relative"
          onClick={() => setActiveItem("cart")}
        >
          <div className="relative">
            <ShoppingBag className={`h-5 w-5 ${activeItem === "cart" ? "text-primary" : "text-gray-500"}`} />
            {cartCount > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-primary text-white text-[10px]"
                variant="default"
              >
                {cartCount}
              </Badge>
            )}
          </div>
          <span className={`text-xs mt-1 ${activeItem === "cart" ? "text-primary font-medium" : "text-gray-500"}`}>
            Carrito
          </span>
        </Link>

        {/* Perfil */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5"
          onClick={() => setActiveItem("profile")}
        >
          <User className={`h-5 w-5 ${activeItem === "profile" ? "text-primary" : "text-gray-500"}`} />
          <span className={`text-xs mt-1 ${activeItem === "profile" ? "text-primary font-medium" : "text-gray-500"}`}>
            Perfil
          </span>
        </Link>
      </div>
    </div>
  )
}
