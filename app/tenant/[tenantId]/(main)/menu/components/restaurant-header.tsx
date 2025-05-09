"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info, Star, Clock, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { isRestaurantOpen } from "../utils/restaurant-hours"

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
  const bannerImage = "/delicious-food-banner.png"
  const logoImage = restaurantConfig?.basicInfo?.logo || "/restaurant-logo.png"
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const shortDescription = restaurantConfig?.basicInfo?.shortDescription || "Deliciosa comida para todos los gustos"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  return (
    <div className="bg-white">
      {/* Banner con controles */}
      <div className="relative">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={bannerImage || "/placeholder.svg"}
            alt={`Banner de ${restaurantName}`}
            fill
            className="object-cover"
            priority
          />

          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10">
                <Star className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10">
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
      <div className="mt-14 text-center px-4">
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

        <div className="flex items-center justify-center mt-2">
          <Badge
            variant="outline"
            className={`px-3 py-1 text-sm font-medium ${
              isOpen ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
            }`}
            onClick={onInfoClick}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></div>
            {isOpen ? "Abierto ahora" : "Cerrado"}
            <Clock className="ml-2 h-3.5 w-3.5" />
          </Badge>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 inline mr-1" />
          {address}
        </div>

        <div className="bg-green-100 text-green-800 rounded-full px-4 py-1 text-sm font-medium inline-block mt-3">
          800+ pidieron de nuevo
        </div>

        {/* Opciones de entrega */}
        <div className="flex justify-between items-center mt-4 border-t border-b py-4">
          <div className="flex-1 text-center">
            <Button variant="outline" className="rounded-full px-6 bg-gray-100 border-gray-200">
              Entrega
            </Button>
          </div>
          <div className="flex-1 text-center">
            <Button variant="outline" className="rounded-full px-6 text-gray-500 border-transparent">
              Recolección
            </Button>
          </div>
        </div>

        {/* Información de entrega */}
        <div className="flex justify-between items-center py-4 border-b">
          <div className="text-left">
            <div className="text-sm font-medium">Costo de envío: $2.99</div>
            <div className="text-xs text-gray-500">$0 con Pedido Premium</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">30 min</div>
            <div className="text-xs text-gray-500">Llegada estimada</div>
          </div>
        </div>
      </div>
    </div>
  )
}
