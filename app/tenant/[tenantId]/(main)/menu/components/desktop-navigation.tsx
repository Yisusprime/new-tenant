"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function DesktopNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(3) // Example cart count

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`bg-white border-b border-gray-200 transition-shadow ${isScrolled ? "shadow-md" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú izquierdo */}
          <div className="flex items-center">
            <Link href="#" className="flex items-center mr-8">
              <div className="relative w-8 h-8 mr-2">
                <Image src="/restaurant-logo.png" alt="Logo" fill sizes="32px" className="object-contain" />
              </div>
              <span className="font-bold text-lg">Restaurante</span>
            </Link>

            <nav className="hidden lg:flex space-x-6">
              <Link href="#" className="text-gray-700 hover:text-primary font-medium">
                Menú
              </Link>
              <Link href="#" className="text-gray-700 hover:text-primary">
                Promociones
              </Link>
              <Link href="#" className="text-gray-700 hover:text-primary">
                Ubicaciones
              </Link>
              <Link href="#" className="text-gray-700 hover:text-primary">
                Sobre nosotros
              </Link>
            </nav>
          </div>

          {/* Menú móvil para tablets */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 mr-2">
                      <Image src="/restaurant-logo.png" alt="Logo" fill sizes="32px" className="object-contain" />
                    </div>
                    <span className="font-bold text-lg">Restaurante</span>
                  </div>
                </div>
                <nav className="flex flex-col space-y-6">
                  <Link href="#" className="text-lg font-medium hover:text-primary">
                    Menú
                  </Link>
                  <Link href="#" className="text-lg hover:text-primary">
                    Promociones
                  </Link>
                  <Link href="#" className="text-lg hover:text-primary">
                    Ubicaciones
                  </Link>
                  <Link href="#" className="text-lg hover:text-primary">
                    Sobre nosotros
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda */}
            {isSearchOpen ? (
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="w-64 pr-8"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="text-gray-700">
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Carrito */}
            <Button variant="ghost" size="icon" className="relative text-gray-700">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                  variant="default"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Usuario */}
            <Button variant="ghost" size="icon" className="text-gray-700">
              <User className="h-5 w-5" />
            </Button>

            {/* Botón de pedido */}
            <Button className="hidden md:flex">Ordenar ahora</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
