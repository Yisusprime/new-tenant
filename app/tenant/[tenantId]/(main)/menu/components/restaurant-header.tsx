"use client"

import { useState } from "react"
import Image from "next/image"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RestaurantHeader({
  restaurantData,
  restaurantConfig,
  onInfoClick,
}: {
  restaurantData: any
  restaurantConfig: any
  onInfoClick: () => void
}) {
  const [imageError, setImageError] = useState(false)

  // Obtener la información básica del restaurante
  const basicInfo = restaurantConfig?.basicInfo || {}

  // Determinar qué logo mostrar
  const logoUrl = basicInfo.logo || "/restaurant-logo.png"

  // Determinar si hay un banner personalizado
  const hasBanner = basicInfo.bannerImage && !imageError

  return (
    <div className="relative">
      {/* Banner del restaurante */}
      <div className="relative w-full h-48 bg-gradient-to-r from-primary/80 to-primary">
        {hasBanner ? (
          <Image
            src={basicInfo.bannerImage || "/placeholder.svg"}
            alt={`Banner de ${restaurantData.name}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
        ) : null}

        {/* Overlay para asegurar que el texto sea legible */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido sobre el banner */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="flex items-end">
          {/* Logo del restaurante */}
          <div className="relative w-20 h-20 bg-white rounded-lg shadow-md overflow-hidden border-2 border-white mr-3">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt={`Logo de ${restaurantData.name}`}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 text-white">
            <h1 className="text-2xl font-bold">{restaurantData.name}</h1>
            <p className="text-sm opacity-90 line-clamp-1">
              {basicInfo.shortDescription || "Bienvenido a nuestro restaurante"}
            </p>
          </div>

          <Button variant="secondary" size="sm" className="ml-2" onClick={onInfoClick}>
            <Info className="h-4 w-4 mr-1" />
            Info
          </Button>
        </div>
      </div>
    </div>
  )
}
