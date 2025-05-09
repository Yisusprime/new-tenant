"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export function DesktopNavigation({ params }: { params?: { tenantId: string } }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/menu" className="flex items-center">
              <div className="relative w-8 h-8 mr-2">
                <Image src="/restaurant-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg">Restaurante</span>
            </Link>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-6">
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
              <Button variant="ghost" onClick={() => setIsSearchOpen(true)} className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                <span>Buscar</span>
              </Button>
            )}

            {/* Login */}
            <Button variant="ghost" onClick={() => router.push(`/menu/login`)} className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span>Login</span>
            </Button>

            {/* Pedidos */}
            <Button variant="ghost" className="flex items-center relative">
              <ShoppingBag className="h-5 w-5 mr-2" />
              <span>Pedidos</span>
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
