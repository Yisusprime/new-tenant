"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info, Star, Search, User, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isRestaurantOpen } from "../utils/restaurant-hours"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth])

  useEffect(() => {
    if (restaurantConfig?.hours) {
      const open = isRestaurantOpen(restaurantConfig.hours.schedule)
      setIsOpen(open)
    }
  }, [restaurantConfig])

  // Función para construir rutas correctamente
  const buildRoute = (path: string) => {
    // Si estamos en un subdominio, no necesitamos incluir /tenant/[tenantId]
    const isSubdomain =
      typeof window !== "undefined" &&
      window.location.hostname.includes(".") &&
      !window.location.hostname.startsWith("www.") &&
      !window.location.hostname.startsWith("localhost")

    // Extraer el tenantId de la URL actual
    const pathSegments = window.location.pathname.split("/")
    const tenantIdIndex = pathSegments.findIndex((segment) => segment === "tenant") + 1
    const tenantId = pathSegments[tenantIdIndex]

    return isSubdomain ? path : `/tenant/${tenantId}${path}`
  }

  const handleProfileClick = () => {
    if (user) {
      router.push(buildRoute("/menu/profile"))
    } else {
      router.push(buildRoute("/menu/login"))
    }
  }

  const handleOrdersClick = () => {
    if (user) {
      router.push(buildRoute("/menu/orders"))
    } else {
      router.push(buildRoute("/menu/login?redirect=orders"))
    }
  }

  const handleSearchClick = () => {
    router.push(buildRoute("/menu/search"))
  }

  // Usar imágenes de placeholder
  const bannerImage = "/placeholder.svg?key=3wznk"
  const logoImage = "/restaurant-logo.png"
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const shortDescription = restaurantConfig?.basicInfo?.shortDescription || "Deliciosa comida para todos los gustos"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  return (
    <div className="bg-white relative">
      {/* Botones de PC en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-10 hidden md:flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm rounded-full"
          onClick={handleSearchClick}
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm rounded-full"
          onClick={handleProfileClick}
        >
          {user ? (
            <>
              {user.photoURL ? (
                <img src={user.photoURL || "/placeholder.svg"} alt="Perfil" className="h-4 w-4 rounded-full mr-2" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              {user.displayName ? user.displayName.split(" ")[0] : "Perfil"}
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Login
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm rounded-full"
          onClick={handleOrdersClick}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Pedidos
        </Button>
      </div>

      {/* Banner con controles */}
      <div className="relative">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={bannerImage || "/placeholder.svg"}
            alt={`Banner de ${restaurantName}`}
            fill
            className="object-cover"
            priority
          />

          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            {/* Botón de abierto/cerrado en la esquina superior izquierda */}
            <Badge
              variant="outline"
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                isOpen ? "bg-green-500/90 text-white border-green-600" : "bg-red-500/90 text-white border-red-600"
              }`}
              onClick={onInfoClick}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-white" : "bg-white"}`}></div>
              {isOpen ? "Abierto ahora" : "Cerrado"}
            </Badge>

            <div className="flex gap-2 md:hidden">
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10">
                <Star className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10"
                onClick={onInfoClick}
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Logo superpuesto */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
          <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            <Image
              src={logoImage || "/placeholder.svg"}
              alt={`Logo de ${restaurantName}`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Información del restaurante */}
      <div className="mt-14 text-center px-4 pb-4">
        <h1 className="text-2xl font-bold">{restaurantName}</h1>

        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span>4.5</span>
          </div>
          <span className="text-gray-300">•</span>
          <span>(200+)</span>
          <span className="text-gray-300">•</span>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>0.9 km</span>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 inline mr-1" />
          {address}
        </div>
      </div>
    </div>
  )
}
