"use client"

import { useState } from "react"
import { Search, User, ShoppingBag, Info, MapPin, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const [imageError, setImageError] = useState({ logo: false, banner: false })

  // Obtener las URLs de las imágenes o usar las por defecto
  const logoUrl =
    restaurantConfig?.basicInfo?.logo && !imageError.logo
      ? restaurantConfig.basicInfo.logo
      : "/default-restaurant-logo.png"

  const bannerUrl =
    restaurantConfig?.basicInfo?.bannerImage && !imageError.banner
      ? restaurantConfig.basicInfo.bannerImage
      : "/default-restaurant-banner.png"

  const restaurantName = restaurantConfig?.basicInfo?.name || restaurantData?.name || "Restaurante"
  const shortDescription = restaurantConfig?.basicInfo?.shortDescription || "Deliciosa comida para ti"

  // Verificar si el restaurante está abierto
  const isOpen = true // Por ahora siempre abierto, puedes implementar lógica de horarios aquí

  const handleLogoError = () => {
    setImageError((prev) => ({ ...prev, logo: true }))
  }

  const handleBannerError = () => {
    setImageError((prev) => ({ ...prev, banner: true }))
  }

  return (
    <div className="relative">
      {/* Banner de fondo */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src={bannerUrl || "/placeholder.svg"}
          alt={`Banner de ${restaurantName}`}
          fill
          className="object-cover"
          onError={handleBannerError}
          priority
        />
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Header superior */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          {/* Estado del restaurante */}
          <div className="flex items-center">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                isOpen ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isOpen ? "Abierto" : "Cerrado"}
            </span>
          </div>

          {/* Iconos de navegación */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Información del restaurante */}
      <div className="relative bg-white px-4 py-6 -mt-8 mx-4 rounded-t-3xl shadow-lg">
        {/* Logo del restaurante */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt={`Logo de ${restaurantName}`}
              fill
              className="object-cover"
              onError={handleLogoError}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="pt-16 text-center">
          {/* Nombre del restaurante */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{restaurantName}</h1>

          {/* Descripción corta */}
          {shortDescription && <p className="text-gray-600 mb-4 max-w-md mx-auto">{shortDescription}</p>}

          {/* Información adicional */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-500 mb-4">
            {/* Calificación */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">4.5</span>
              <span>(200+)</span>
            </div>

            {/* Distancia */}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>0.9 km</span>
            </div>

            {/* Tiempo de entrega */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>30-45 min</span>
            </div>
          </div>

          {/* Dirección */}
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{restaurantConfig?.location?.address || "Dirección no disponible"}</span>
          </div>

          {/* Botón de información */}
          <Button variant="outline" size="sm" onClick={onInfoClick} className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Más información
          </Button>
        </div>
      </div>
    </div>
  )
}
