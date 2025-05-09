"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isRestaurantOpen } from "../utils/restaurant-hours"
import { motion } from "framer-motion"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (restaurantConfig?.hours) {
      const open = isRestaurantOpen(restaurantConfig.hours.schedule)
      setIsOpen(open)
    }
  }, [restaurantConfig])

  // Usar imagen de placeholder de Next.js en lugar de la imagen actual
  const bannerImage = "/colorful-restaurant-banner.png"
  const logoImage = restaurantConfig?.basicInfo?.logo || "/restaurant-logo.png"
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const shortDescription = restaurantConfig?.basicInfo?.shortDescription || "Deliciosa comida para todos los gustos"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
          src={bannerImage || "/placeholder.svg"}
          alt={`Banner de ${restaurantName}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20"></div>

        {/* Contenido sobre el banner */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-md">{restaurantName}</h1>
            <p className="text-lg md:text-xl mb-4 max-w-2xl drop-shadow-md">{shortDescription}</p>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{address}</span>
              </div>

              <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{isOpen ? "Abierto ahora" : "Cerrado"}</span>
              </div>

              <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                <span className="text-sm">4.8 (120 reseñas)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Botón de información */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
          onClick={onInfoClick}
        >
          <Info className="h-4 w-4 mr-2" />
          <span>Información</span>
        </Button>
      </div>

      {/* Indicador de abierto/cerrado */}
      <div className="absolute top-4 left-4 z-10">
        <Badge
          variant="outline"
          className={`px-3 py-1.5 text-sm font-medium rounded-full ${
            isOpen ? "bg-green-500/90 text-white border-green-600" : "bg-red-500/90 text-white border-red-600"
          }`}
        >
          <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-white" : "bg-white"}`}></div>
          {isOpen ? "Abierto ahora" : "Cerrado"}
        </Badge>
      </div>
    </div>
  )
}
