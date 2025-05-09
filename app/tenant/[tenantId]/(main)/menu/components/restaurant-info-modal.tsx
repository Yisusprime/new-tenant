"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Phone, Mail, MessageSquare, Facebook, Instagram, Twitter } from "lucide-react"
import { formatSchedule } from "../utils/restaurant-hours"

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
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">{restaurantName}</SheetTitle>
          <SheetDescription>Información del restaurante</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Dirección */}
          <div>
            <h3 className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Dirección
            </h3>
            <p className="mt-2 text-sm text-gray-600">{fullAddress}</p>
          </div>

          <Separator />

          {/* Horarios */}
          <div>
            <h3 className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Horarios
            </h3>
            <div className="mt-2 space-y-2">
              {schedule.length > 0 ? (
                schedule.map((day: any) => (
                  <div key={day.day} className="flex justify-between text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-gray-600">{formatSchedule(day)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Horarios no disponibles</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-medium">Contacto</h3>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span>{phone}</span>
              </div>

              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{email}</span>
              </div>

              {whatsapp && (
                <div className="flex items-center text-sm">
                  <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
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
                <h3 className="text-sm font-medium">Redes sociales</h3>
                <div className="mt-2 space-y-2">
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      <span>Facebook</span>
                    </a>
                  )}

                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-pink-600 hover:underline"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      <span>Instagram</span>
                    </a>
                  )}

                  {twitter && (
                    <a
                      href={twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-400 hover:underline"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      <span>Twitter</span>
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
