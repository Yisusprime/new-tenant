"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Search, ShoppingBag, User, MenuIcon } from "lucide-react"
import { motion } from "framer-motion"

export function MobileNavigation() {
  const [activeItem, setActiveItem] = useState("home")
  const [cartCount, setCartCount] = useState(3) // Simulación de productos en el carrito

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
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

        {/* Menú */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5"
          onClick={() => setActiveItem("menu")}
        >
          <div
            className={`h-12 w-12 rounded-full ${activeItem === "menu" ? "bg-primary" : "bg-gray-100"} flex items-center justify-center -mt-6 shadow-md`}
          >
            <MenuIcon className={`h-6 w-6 ${activeItem === "menu" ? "text-white" : "text-gray-700"}`} />
          </div>
          <span className={`text-xs mt-1 ${activeItem === "menu" ? "text-primary font-medium" : "text-gray-500"}`}>
            Menú
          </span>
        </Link>

        {/* Carrito */}
        <Link
          href="#"
          className="flex flex-col items-center justify-center w-1/5"
          onClick={() => setActiveItem("cart")}
        >
          <div className="relative">
            <ShoppingBag className={`h-5 w-5 ${activeItem === "cart" ? "text-primary" : "text-gray-500"}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
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
    </motion.div>
  )
}
