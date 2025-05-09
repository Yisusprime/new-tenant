"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Info } from "lucide-react"
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
    <div className="relative">
      {/* Banner */}
      <div className="relative h-48 md:h-56 w-full overflow-hidden rounded-b-lg">
        <Image
          src={bannerImage || "/placeholder.svg"}
          alt={`Banner de ${restaurantName}`}
          fill
          className="object-cover"
          priority
        />

        {/* Indicador de abierto/cerrado */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full ${isOpen ? "bg-green-100 hover:bg-green-200 border-green-500" : "bg-red-100 hover:bg-red-200 border-red-500"}`}
            onClick={onInfoClick}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isOpen ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className={`text-xs font-medium ${isOpen ? "text-green-700" : "text-red-700"}`}>
              {isOpen ? "Abierto" : "Cerrado"}
            </span>
            <Info className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Logo y detalles */}
      <div className="px-4 md:px-6 relative max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 -mt-16 md:-mt-20">
          {/* Logo */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            <Image
              src={logoImage || "/placeholder.svg"}
              alt={`Logo de ${restaurantName}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Información del restaurante */}
          <div className="pt-4 md:pt-0 md:mt-16">
            <h1 className="text-2xl md:text-3xl font-bold">{restaurantName}</h1>
            <p className="text-gray-600 mt-1">{shortDescription}</p>

            <div className="flex items-center mt-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{address}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {restaurantConfig?.serviceMethods?.delivery && (
                <Badge variant="outline" className="bg-gray-100">
                  Delivery
                </Badge>
              )}
              {restaurantConfig?.serviceMethods?.takeaway && (
                <Badge variant="outline" className="bg-gray-100">
                  Para llevar
                </Badge>
              )}
              {restaurantConfig?.serviceMethods?.dineIn && (
                <Badge variant="outline" className="bg-gray-100">
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
