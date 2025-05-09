"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Heart, Search, MoreVertical, ArrowLeft } from "lucide-react"
import { isRestaurantOpen } from "../utils/restaurant-hours"
import { Button } from "@/components/ui/button"

interface RestaurantHeaderProps {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}

export function RestaurantHeader({ restaurantData, restaurantConfig, onInfoClick }: RestaurantHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (restaurantConfig?.hours) {
      const open = isRestaurantOpen(restaurantConfig.hours.schedule)
      setIsOpen(open)
    }
  }, [restaurantConfig])

  const bannerImage = restaurantConfig?.basicInfo?.bannerImage || "/restaurant-banner.png"
  const logoImage = restaurantConfig?.basicInfo?.logo || "/restaurant-logo.png"
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"

  return (
    <div className="relative mb-16">
      {/* Top action buttons */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-4">
        <Button variant="ghost" size="icon" className="bg-black/20 text-white rounded-full hover:bg-black/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/20 text-white rounded-full hover:bg-black/30"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/20 text-white rounded-full hover:bg-black/30">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-black/20 text-white rounded-full hover:bg-black/30">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={bannerImage || "/placeholder.svg?height=400&width=800&query=food"}
          alt={`Banner de ${restaurantName}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10"></div>
      </div>

      {/* Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
        <div className="relative w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
          <Image
            src={logoImage || "/placeholder.svg?height=200&width=200&query=logo"}
            alt={`Logo de ${restaurantName}`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Restaurant info */}
      <div className="text-center mt-14 px-4">
        <h1 className="text-2xl font-bold">{restaurantName}</h1>
        <div className="flex items-center justify-center mt-1 text-sm">
          <span className="flex items-center">
            <span className="font-semibold">4.2</span>
            <span className="text-yellow-500 mx-1">★</span>
            <span className="text-gray-500">(2,000+)</span>
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-500">0.9 km</span>
        </div>

        <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{address}</span>
        </div>

        <div className="mt-2 inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
          800+ pidieron de nuevo
        </div>
      </div>
    </div>
  )
}
