"use client"

import { useState } from "react"
import { updateUserProfile } from "@/lib/services/profile-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ProfilePreferencesProps {
  tenantId: string
  userId: string
  profile: any
}

export function ProfilePreferences({ tenantId, userId, profile }: ProfilePreferencesProps) {
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    notifications: profile?.preferences?.notifications ?? true,
    emailOffers: profile?.preferences?.emailOffers ?? true,
    darkMode: profile?.preferences?.darkMode ?? false,
    language: profile?.preferences?.language ?? "es",
    orderUpdates: profile?.preferences?.orderUpdates ?? true,
    savePaymentInfo: profile?.preferences?.savePaymentInfo ?? false,
  })

  const handleToggleChange = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleSelectChange = (key: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateUserProfile(tenantId, userId, {
        preferences,
      })
      toast.success("Preferencias guardadas correctamente")
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
      toast.error("Error al guardar preferencias")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="font-medium">
                Notificaciones push
              </Label>
              <p className="text-sm text-gray-500">Recibe notificaciones sobre tus pedidos y ofertas</p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={() => handleToggleChange("notifications")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailOffers" className="font-medium">
                Ofertas por email
              </Label>
              <p className="text-sm text-gray-500">Recibe promociones y descuentos por correo</p>
            </div>
            <Switch
              id="emailOffers"
              checked={preferences.emailOffers}
              onCheckedChange={() => handleToggleChange("emailOffers")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="orderUpdates" className="font-medium">
                Actualizaciones de pedidos
              </Label>
              <p className="text-sm text-gray-500">Recibe actualizaciones sobre el estado de tus pedidos</p>
            </div>
            <Switch
              id="orderUpdates"
              checked={preferences.orderUpdates}
              onCheckedChange={() => handleToggleChange("orderUpdates")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Personaliza la apariencia de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode" className="font-medium">
                Modo oscuro
              </Label>
              <p className="text-sm text-gray-500">Cambia entre modo claro y oscuro</p>
            </div>
            <Switch
              id="darkMode"
              checked={preferences.darkMode}
              onCheckedChange={() => handleToggleChange("darkMode")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="font-medium">
              Idioma
            </Label>
            <Select value={preferences.language} onValueChange={(value) => handleSelectChange("language", value)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Selecciona un idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacidad y seguridad</CardTitle>
          <CardDescription>Configura tus preferencias de privacidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="savePaymentInfo" className="font-medium">
                Guardar información de pago
              </Label>
              <p className="text-sm text-gray-500">Guarda tus métodos de pago para futuras compras</p>
            </div>
            <Switch
              id="savePaymentInfo"
              checked={preferences.savePaymentInfo}
              onCheckedChange={() => handleToggleChange("savePaymentInfo")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar preferencias
        </Button>
      </div>
    </div>
  )
}
