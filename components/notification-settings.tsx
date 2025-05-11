"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Bell, BellOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NotificationSettingsProps {
  enabled: boolean
  onToggle: () => boolean
}

export function NotificationSettings({ enabled, onToggle }: NotificationSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [browserPermission, setBrowserPermission] = useState<string>("default")

  useEffect(() => {
    if ("Notification" in window) {
      setBrowserPermission(Notification.permission)
    }
  }, [])

  const handleToggle = () => {
    const newState = onToggle()
    setIsEnabled(newState)
  }

  const requestBrowserPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        setBrowserPermission(permission)
      })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          {isEnabled ? (
            <Bell className="h-5 w-5 mr-2 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 mr-2 text-gray-400" />
          )}
          Configuración de notificaciones
        </CardTitle>
        <CardDescription>Recibe alertas cuando lleguen nuevos pedidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Notificaciones de pedidos</div>
            <div className="text-sm text-muted-foreground">{isEnabled ? "Activadas" : "Desactivadas"}</div>
          </div>
          <Switch checked={isEnabled} onCheckedChange={handleToggle} />
        </div>

        {isEnabled && browserPermission !== "granted" && "Notification" in window && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-2">
              Para recibir notificaciones cuando la pestaña no esté activa, necesitamos tu permiso.
            </p>
            <Button size="sm" variant="outline" onClick={requestBrowserPermission}>
              Permitir notificaciones del navegador
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
