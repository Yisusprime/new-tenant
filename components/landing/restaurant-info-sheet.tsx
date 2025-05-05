"use client"

import Image from "next/image"
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Phone, Globe, Mail } from "lucide-react"

interface RestaurantInfo {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  openingHours: { day: string; hours: string }[]
  features: string[]
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
  }
}

interface RestaurantInfoSheetProps {
  restaurantInfo: RestaurantInfo
  bannerUrl: string
}

export function RestaurantInfoSheet({ restaurantInfo, bannerUrl }: RestaurantInfoSheetProps) {
  return (
    <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto hide-scrollbar">
      <SheetHeader className="text-left">
        <SheetTitle className="text-xl">Información del Restaurante</SheetTitle>
      </SheetHeader>

      {/* Banner del restaurante */}
      <div className="mt-4 relative h-40 rounded-lg overflow-hidden">
        <Image
          src={bannerUrl || "/modern-restaurant-interior.png"}
          alt={restaurantInfo.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Información del restaurante */}
      <div className="mt-4">
        <h3 className="text-lg font-bold">{restaurantInfo.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{restaurantInfo.description}</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{restaurantInfo.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{restaurantInfo.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <Mail size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{restaurantInfo.email}</span>
          </div>
          <div className="flex items-start gap-2">
            <Globe size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{restaurantInfo.website}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Horarios */}
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Clock size={18} />
            Horarios
          </h4>
          <div className="space-y-2">
            {restaurantInfo.openingHours.map((schedule, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{schedule.day}</span>
                <span>{schedule.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Características */}
        <div>
          <h4 className="font-medium mb-2">Características</h4>
          <div className="flex flex-wrap gap-2">
            {restaurantInfo.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Redes sociales */}
        <div>
          <h4 className="font-medium mb-2">Redes Sociales</h4>
          <div className="space-y-2 text-sm">
            <div>Facebook: {restaurantInfo.socialMedia.facebook}</div>
            <div>Instagram: {restaurantInfo.socialMedia.instagram}</div>
            <div>Twitter: {restaurantInfo.socialMedia.twitter}</div>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}
