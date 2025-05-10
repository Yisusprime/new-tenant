"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Search, ShoppingBag, User, Menu, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getAuth } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DesktopNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitials, setUserInitials] = useState("")
  const [userPhotoURL, setUserPhotoURL] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const auth = getAuth()

  // Extract tenantId from pathname if needed for any operations
  const pathSegments = pathname.split("/")
  const tenantIdIndex = pathSegments.findIndex((segment) => segment === "tenant") + 1
  const tenantId = pathSegments[tenantIdIndex] || ""

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

  // Función para construir rutas correctamente
  const buildRoute = (path) => {
    // Si estamos en un subdominio, usamos rutas relativas
    if (window.location.hostname.includes(".")) {
      return path
    }
    // Si estamos en localhost o similar, incluimos el tenant en la ruta
    return `/tenant/${tenantId}${path}`
  }

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push(buildRoute("/menu/profile"))
    } else {
      router.push(buildRoute("/menu/login"))
    }
  }

  const handleOrdersClick = () => {
    if (isLoggedIn) {
      router.push(buildRoute("/menu/orders"))
    } else {
      router.push(buildRoute("/menu/login?redirect=orders"))
    }
  }

  const handleSearchClick = () => {
    if (isSearchOpen) {
      // Implementar la búsqueda aquí
      console.log("Realizando búsqueda...")
    } else {
      setIsSearchOpen(true)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const searchTerm = e.target.elements.search.value
    console.log("Buscando:", searchTerm)
    // Implementar la búsqueda aquí
    router.push(buildRoute(`/menu/search?q=${encodeURIComponent(searchTerm)}`))
    setIsSearchOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú izquierdo */}
          <div className="flex items-center">
            <Link href={buildRoute("/menu")} className="flex items-center mr-8">
              <div className="relative w-8 h-8 mr-2">
                <Image src="/restaurant-logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg">Restaurante</span>
            </Link>

            <nav className="hidden lg:flex space-x-6">
              <Link href={buildRoute("/menu")} className="text-gray-700 hover:text-primary font-medium">
                Menú
              </Link>
              <Link href={buildRoute("/menu/promotions")} className="text-gray-700 hover:text-primary">
                Promociones
              </Link>
              <Link href={buildRoute("/menu/locations")} className="text-gray-700 hover:text-primary">
                Ubicaciones
              </Link>
              <Link href={buildRoute("/menu/about")} className="text-gray-700 hover:text-primary">
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
                  <Link href={buildRoute("/menu")} className="text-lg font-medium">
                    Menú
                  </Link>
                  <Link href={buildRoute("/menu/promotions")} className="text-lg">
                    Promociones
                  </Link>
                  <Link href={buildRoute("/menu/locations")} className="text-lg">
                    Ubicaciones
                  </Link>
                  <Link href={buildRoute("/menu/about")} className="text-lg">
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
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input
                  type="search"
                  name="search"
                  placeholder="Buscar..."
                  className="w-64 pr-8"
                  autoFocus
                  onBlur={(e) => {
                    // Solo cerrar si no se hace clic en el botón de búsqueda
                    if (!e.relatedTarget || e.relatedTarget.type !== "submit") {
                      setTimeout(() => setIsSearchOpen(false), 200)
                    }
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} className="hover:bg-gray-100">
                <Search className="h-5 w-5" />
                <span className="sr-only">Buscar</span>
              </Button>
            )}

            {/* Seguimiento de pedidos */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOrdersClick}
              title="Seguimiento de pedidos"
              className="hover:bg-gray-100"
            >
              <Package className="h-5 w-5" />
              <span className="sr-only">Pedidos</span>
            </Button>

            {/* Carrito */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100"
              onClick={() => router.push(buildRoute("/menu/cart"))}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Carrito</span>
            </Button>

            {/* Usuario */}
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleProfileClick}
                className="relative hover:bg-gray-100"
                title="Mi perfil"
              >
                <Avatar className="h-8 w-8">
                  {userPhotoURL ? <AvatarImage src={userPhotoURL || "/placeholder.svg"} alt="Foto de perfil" /> : null}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Perfil</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleProfileClick}
                title="Iniciar sesión"
                className="hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Iniciar sesión</span>
              </Button>
            )}

            {/* Botón de pedido */}
            <Button className="hidden md:flex" onClick={() => router.push(buildRoute("/menu/cart"))}>
              Ordenar ahora
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
