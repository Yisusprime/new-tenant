"use client"

import Link from "next/link"
import { Home, Search, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DesktopNavigation() {
  const router = useRouter()

  return (
    <div className="hidden md:flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      <nav className="flex items-center space-x-4">
        <Link href="/menu" className="flex items-center text-gray-700 hover:text-gray-900">
          <Home className="h-4 w-4 mr-1" />
          Inicio
        </Link>
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </nav>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/menu/login")}>
          <User className="h-4 w-4 mr-2" />
          Login
        </Button>
        <Button variant="outline" size="sm">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Pedidos
        </Button>
      </div>
    </div>
  )
}
