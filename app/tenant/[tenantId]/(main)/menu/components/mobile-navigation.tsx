"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, Search, User, Plus, Package } from "lucide-react"
import { getAuth } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MobileNavigation() {
  const [cartCount, setCartCount] = useState(3) // Simulación de productos en el carrito
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitials, setUserInitials] = useState("")
  const [userPhotoURL, setUserPhotoURL] = useState("")
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true)
        // Get user initials from display name or email
        if (user.displayName) {
          const names = user.displayName.split(" ")
          const initials = names.map((name) => name.charAt(0)).join("")
          setUserInitials(initials.toUpperCase())
        } else if (user.email) {
          setUserInitials(user.email.charAt(0).toUpperCase())
        }

        // Set user photo if available
        if (user.photoURL) {
          setUserPhotoURL(user.photoURL)
        }
      } else {
        setIsLoggedIn(false)
        setUserInitials("")
        setUserPhotoURL("")
      }
    })

    return () => unsubscribe()
  }, [auth])

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/menu/profile")
    } else {
      router.push("/menu/login")
    }
  }

  const handleOrdersClick = () => {
    if (isLoggedIn) {
      router.push("/menu/orders")
    } else {
      router.push("/menu/login?redirect=orders")
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around h-14">
        <Link href="/menu" className="flex flex-col items-center justify-center">
          <Home className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Inicio</span>
        </Link>

        <Link href="#" className="flex flex-col items-center justify-center">
          <Search className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Buscar</span>
        </Link>

        {/* Botón central con signo + */}
        <Link href="#" className="flex flex-col items-center justify-center">
          <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center -mt-5">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs mt-1 text-gray-500">Ordenar</span>
        </Link>

        {/* Seguimiento de pedidos */}
        <div onClick={handleOrdersClick} className="flex flex-col items-center justify-center cursor-pointer">
          <Package className="h-5 w-5 text-gray-500" />
          <span className="text-xs mt-1 text-gray-500">Pedidos</span>
        </div>

        {/* Perfil de usuario */}
        <div onClick={handleProfileClick} className="flex flex-col items-center justify-center cursor-pointer">
          {isLoggedIn ? (
            <>
              <div className="relative flex items-center justify-center">
                <Avatar className="h-5 w-5">
                  {userPhotoURL ? <AvatarImage src={userPhotoURL || "/placeholder.svg"} alt="Foto de perfil" /> : null}
                  <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs mt-1 text-gray-500">Perfil</span>
            </>
          ) : (
            <>
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-xs mt-1 text-gray-500">Iniciar</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
