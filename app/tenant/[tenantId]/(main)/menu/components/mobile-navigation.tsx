"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, Search, ShoppingBag, User, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function MobileNavigation({ params }: { params?: { tenantId: string } }) {
  const [cartCount, setCartCount] = useState(3) // Simulación de productos en el carrito
  const router = useRouter()
  const tenantId = params?.tenantId || ""

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around h-14">
        <Link href="#" className="flex flex-col items-center justify-center">
          <Home className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Inicio</span>
        </Link>

        <Link href="#" className="flex flex-col items-center justify-center">
          <Search className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Buscar</span>
        </Link>

        {/* Botón central con signo + */}
        <div
          className="flex flex-col items-center justify-center"
          onClick={() => router.push(`/tenant/${params.tenantId}/menu/login`)}
        >
          <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center -mt-5">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs mt-1 text-gray-500">Ordenar</span>
        </div>

        <Link href="#" className="flex flex-col items-center justify-center">
          <div className="relative">
            <ShoppingBag className="h-5 w-5 text-gray-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-1 text-gray-500">Carrito</span>
        </Link>

        <Link href={`/tenant/${params.tenantId}/menu/login`} className="flex flex-col items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Perfil</span>
        </Link>
      </div>
    </div>
  )
}
