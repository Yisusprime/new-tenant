"use client"

import { useState } from "react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export function ProfilePreferences({ tenantId, userId, profile }: { tenantId: string; userId: string; profile: any }) {
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    emailNotifications: profile?.preferences?.emailNotifications ?? true,
    smsNotifications: profile?.preferences?.smsNotifications ?? false,
    marketingEmails: profile?.preferences?.marketingEmails ?? false,
    orderUpdates: profile?.preferences?.orderUpdates ?? true,
    theme: profile?.preferences?.theme ?? "system",
    language: profile?.preferences?.language ?? "es",
  })

  const handleSwitchChange = (name: string) => {
    setPreferences({
      ...preferences,
      [name]: !preferences[name as keyof typeof preferences],
    })
  }

  const handleRadioChange = (name: string, value: string) => {
    setPreferences({
      ...preferences,
      [name]: value,
    })
  }

  const handleSavePreferences = async () => {
    setLoading(true)

    try {
      const userProfileRef = doc(db, `tenants/${tenantId}/users/${userId}`)
      await setDoc(
        userProfileRef,
        {
          preferences,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error al guardar preferencias:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Notificaciones</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificaciones por correo</Label>
                <p className="text-sm text-gray-500">Recibe actualizaciones importantes por correo electrónico</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleSwitchChange("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                <p className="text-sm text-gray-500">Recibe actualizaciones importantes por mensaje de texto</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={preferences.smsNotifications}
                onCheckedChange={() => handleSwitchChange("smsNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Correos de marketing</Label>
                <p className="text-sm text-gray-500">Recibe ofertas especiales y promociones</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={preferences.marketingEmails}
                onCheckedChange={() => handleSwitchChange("marketingEmails")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-updates">Actualizaciones de pedidos</Label>
                <p className="text-sm text-gray-500">Recibe actualizaciones sobre el estado de tus pedidos</p>
              </div>
              <Switch
                id="order-updates"
                checked={preferences.orderUpdates}
                onCheckedChange={() => handleSwitchChange("orderUpdates")}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-4">Apariencia</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme" className="mb-2 block">
                Tema
              </Label>
              <RadioGroup
                id="theme"
                value={preferences.theme}
                onValueChange={(value) => handleRadioChange("theme", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light">Claro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark">Oscuro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system">Sistema</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="language" className="mb-2 block">
                Idioma
              </Label>
              <RadioGroup
                id="language"
                value={preferences.language}
                onValueChange={(value) => handleRadioChange("language", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="lang-es" />
                  <Label htmlFor="lang-es">Español</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en">Inglés</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <Button onClick={handleSavePreferences} disabled={loading} className="w-full md:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Preferencias
        </Button>
      </CardContent>
    </Card>
  )
}
