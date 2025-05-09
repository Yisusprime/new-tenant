"use client"

import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Phone, Mail, MessageSquare, Facebook, Instagram, Twitter, Globe, Star } from "lucide-react"
import { formatSchedule } from "../utils/restaurant-hours"
import Image from "next/image"

interface RestaurantInfoModalProps {
  open: boolean
  onClose: () => void
  restaurantData: any
  restaurantConfig: any
}

export function RestaurantInfoModal({ open, onClose, restaurantData, restaurantConfig }: RestaurantInfoModalProps) {
  const restaurantName = restaurantData?.name || restaurantConfig?.basicInfo?.name || "Restaurante"
  const address = restaurantConfig?.location?.address || "Dirección no disponible"
  const city = restaurantConfig?.location?.city || ""
  const region = restaurantConfig?.location?.region || ""
  const fullAddress = [address, city, region].filter(Boolean).join(", ")
  const logoImage = restaurantConfig?.basicInfo?.logo || "/restaurant-logo.png"

  const phone = restaurantConfig?.contactInfo?.phone || "No disponible"
  const email = restaurantConfig?.contactInfo?.email || "No disponible"
  const whatsapp = restaurantConfig?.contactInfo?.whatsapp || null

  const facebook = restaurantConfig?.socialMedia?.facebook || null
  const instagram = restaurantConfig?.socialMedia?.instagram || null
  const twitter = restaurantConfig?.socialMedia?.twitter || null

  const schedule = restaurantConfig?.hours?.schedule || []

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={logoImage || "/placeholder.svg"}
              alt={restaurantName}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div>
            <SheetTitle className="text-xl flex items-center gap-2">
              {restaurantName}
              <div className="flex items-center bg-yellow-400 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-medium">
                <Star className="h-3 w-3 mr-0.5 fill-yellow-800" />
                4.8
              </div>
            </SheetTitle>
            <SheetDescription className="text-sm">Información del restaurante</SheetDescription>
          </div>
        </div>

        <div className="space-y-6">
          {/* Dirección */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium flex items-center mb-2">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Dirección
            </h3>
            <p className="text-sm text-gray-600">{fullAddress}</p>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-3">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Horarios
            </h3>
            <div className="bg-white rounded-lg border p-3">
              <div className="space-y-2">
                {schedule.length > 0 ? (
                  schedule.map((day: any) => (
                    <div key={day.day} className="flex justify-between text-sm">
                      <span className="font-medium">{day.day}</span>
                      <span className={`${day.isOpen ? "text-gray-600" : "text-red-500"}`}>{formatSchedule(day)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Horarios no disponibles</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-medium flex items-center mb-3">
              <Phone className="h-4 w-4 mr-2 text-primary" />
              Contacto
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm bg-white p-3 rounded-lg border">
                <Phone className="h-4 w-4 mr-3 text-gray-500" />
                <span>{phone}</span>
              </div>

              <div className="flex items-center text-sm bg-white p-3 rounded-lg border">
                <Mail className="h-4 w-4 mr-3 text-gray-500" />
                <span>{email}</span>
              </div>

              {whatsapp && (
                <div className="flex items-center text-sm bg-white p-3 rounded-lg border">
                  <MessageSquare className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{whatsapp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Redes sociales */}
          {(facebook || instagram || twitter) && (
            <>
              <Separator />

              <div>
                <h3 className="text-sm font-medium flex items-center mb-3">
                  <Globe className="h-4 w-4 mr-2 text-primary" />
                  Redes sociales
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Facebook className="h-6 w-6 text-blue-600 mb-1" />
                      <span className="text-xs">Facebook</span>
                    </a>
                  )}

                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Instagram className="h-6 w-6 text-pink-600 mb-1" />
                      <span className="text-xs">Instagram</span>
                    </a>
                  )}

                  {twitter && (
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Twitter className="h-6 w-6 text-blue-400 mb-1" />
                      <span className="text-xs">Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
