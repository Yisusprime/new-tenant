"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useRouter } from "next/navigation"

export function DesktopNavigation({ params }: { params?: { tenantId: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()
  const tenantId = params?.tenantId || ""

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú izquierdo */}
          <div className="flex items-center">
            <Link href="#" className="flex items-center mr-8">
              <div className="relative w-8 h-8 mr-2">
                <Image src="/restaurant-logo.png" alt="Logo" fill className="object-contain" />
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="#" className="text-lg font-medium">
                    Menú
                  </Link>
                  <Link href="#" className="text-lg">
                    Promociones
                  </Link>
                  <Link href="#" className="text-lg">
                    Ubicaciones
                  </Link>
                  <Link href="#" className="text-lg">
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
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Carrito */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Usuario */}
            <Button variant="ghost" size="icon" onClick={() => router.push(`/tenant/${params.tenantId}/menu/login`)}>
              <User className="h-5 w-5" />
            </Button>

            {/* Botón de pedido */}
            <Button className="hidden md:flex" onClick={() => router.push(`/tenant/${params.tenantId}/menu/login`)}>
              Ordenar ahora
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
