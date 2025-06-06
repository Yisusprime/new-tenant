"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info, Star, Search, User, ShoppingBag, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useRouter, useParams } from "next/navigation"
import { useRestaurantStatus } from "@/lib/context/restaurant-status-context"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const auth = getAuth()
  const [imageError, setImageError] = useState({ logo: false, banner: false })

  const { isOpen, isWithinHours, hasCashRegister, isLoading, statusMessage } = useRestaurantStatus()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth])

  // Función para construir rutas correctamente
  const buildRoute = (path: string) => {
    const isSubdomain =
      typeof window !== "undefined" &&
      window.location.hostname.includes(".") &&
      !window.location.hostname.startsWith("www.") &&
      !window.location.hostname.startsWith("localhost")

    const pathSegments = window.location.pathname.split("/")
    const tenantIdIndex = pathSegments.findIndex((segment) => segment === "tenant") + 1
    const currentTenantId = pathSegments[tenantIdIndex]

    return isSubdomain ? path : `/tenant/${currentTenantId}${path}`
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

  const handleLogoError = () => {
    setImageError((prev) => ({ ...prev, logo: true }))
  }

  const handleBannerError = () => {
    setImageError((prev) => ({ ...prev, banner: true }))
  }

  // Usar imágenes personalizadas o por defecto
  const bannerImage =
    restaurantConfig?.basicInfo?.bannerImage && !imageError.banner
      ? restaurantConfig.basicInfo.bannerImage
      : "/placeholder.svg?key=3wznk"

  const logoImage =
    restaurantConfig?.basicInfo?.logo && !imageError.logo ? restaurantConfig.basicInfo.logo : "/restaurant-logo.png"

  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  // Determinar el estilo del badge según el estado
  const getBadgeStyle = () => {
    if (isLoading) {
      return "bg-gray-500/90 text-white border-gray-600"
    }

    if (!isWithinHours) {
      return "bg-red-500/90 text-white border-red-600"
    }

    if (!hasCashRegister) {
      return "bg-orange-500/90 text-white border-orange-600"
    }

    return "bg-green-500/90 text-white border-green-600"
  }

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
            onError={handleBannerError}
            priority
          />

          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            {/* Botón de estado del restaurante */}
            <Badge
              variant="outline"
              className={`px-3 py-1.5 text-sm font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${getBadgeStyle()}`}
              onClick={onInfoClick}
            >
              <div className="w-2 h-2 rounded-full mr-2 bg-white"></div>
              {statusMessage}
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
              onError={handleLogoError}
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

        {/* Mensaje profesional cuando no está disponible para pedidos */}
        {isWithinHours && !hasCashRegister && !isLoading && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center text-orange-700 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span>Estamos preparando todo para atenderte. Vuelve en unos minutos.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
