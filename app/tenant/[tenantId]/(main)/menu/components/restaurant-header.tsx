"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info, Star } from "lucide-react"
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

  const bannerImage = restaurantConfig?.basicInfo?.bannerImage || "/restaurant-banner.png"
  const logoImage = restaurantConfig?.basicInfo?.logo || "/restaurant-logo.png"
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const shortDescription = restaurantConfig?.basicInfo?.shortDescription || "Deliciosa comida para todos los gustos"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  return (
    <div className="relative mb-6">
      {/* Banner with gradient overlay */}
      <div className="relative h-56 md:h-64 w-full overflow-hidden rounded-lg">
        <Image
          src={bannerImage || "/placeholder.svg"}
          alt={`Banner de ${restaurantName}`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: "center 60%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Indicador de abierto/cerrado */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full backdrop-blur-sm ${
              isOpen
                ? "bg-green-100/80 hover:bg-green-200/80 border-green-500 text-green-700"
                : "bg-red-100/80 hover:bg-red-200/80 border-red-500 text-red-700"
            }`}
            onClick={onInfoClick}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-xs font-medium">{isOpen ? "Abierto" : "Cerrado"}</span>
            <Info className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Logo y detalles */}
      <div className="relative px-4 md:px-6 -mt-24">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          {/* Logo */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl border-4 border-white overflow-hidden bg-white shadow-lg">
            <Image
              src={logoImage || "/placeholder.svg"}
              alt={`Logo de ${restaurantName}`}
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-cover"
            />
          </div>

          {/* Información del restaurante */}
          <div className="flex-1 md:pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white md:text-gray-900">{restaurantName}</h1>
              <div className="flex items-center bg-yellow-400 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                <Star className="h-3 w-3 mr-1 fill-yellow-800" />
                4.8
              </div>
            </div>
            <p className="text-white md:text-gray-600 mt-1">{shortDescription}</p>

            <div className="flex items-center mt-2 text-sm text-white md:text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{address}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {restaurantConfig?.serviceMethods?.delivery && (
                <Badge variant="outline" className="bg-white/90 md:bg-gray-100 backdrop-blur-sm">
                  Delivery
                </Badge>
              )}
              {restaurantConfig?.serviceMethods?.takeaway && (
                <Badge variant="outline" className="bg-white/90 md:bg-gray-100 backdrop-blur-sm">
                  Para llevar
                </Badge>
              )}
              {restaurantConfig?.serviceMethods?.dineIn && (
                <Badge variant="outline" className="bg-white/90 md:bg-gray-100 backdrop-blur-sm">
                  En el local
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
