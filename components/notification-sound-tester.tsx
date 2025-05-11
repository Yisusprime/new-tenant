"use client"

import { Button } from "@/components/ui/button"
import { useOrderNotifications } from "@/lib/hooks/use-order-notifications"
import { useState } from "react"

export function NotificationSoundTester({ tenantId, branchId }: { tenantId: string; branchId: string }) {
  const { testSound, toggleNotifications, notificationsEnabled } = useOrderNotifications(tenantId, branchId)
  const [status, setStatus] = useState<string>("")

  const handleTestSound = () => {
    try {
      const loaded = testSound()
      setStatus(loaded ? "Sonido reproducido correctamente" : "El audio no está cargado completamente")
    } catch (err) {
      setStatus(`Error al reproducir: ${err}`)
    }
  }

  const handleToggle = () => {
    const enabled = toggleNotifications()
    setStatus(`Notificaciones ${enabled ? "activadas" : "desactivadas"}`)
  }

  return (
    <div className="p-4 border rounded-md mb-4">
      <h3 className="text-lg font-medium mb-2">Prueba de sonido de notificaciones</h3>
      <div className="flex gap-2 mb-2">
        <Button onClick={handleTestSound} variant="outline">
          Probar sonido
        </Button>
        <Button onClick={handleToggle} variant={notificationsEnabled() ? "default" : "secondary"}>
          {notificationsEnabled() ? "Desactivar notificaciones" : "Activar notificaciones"}
        </Button>
      </div>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
