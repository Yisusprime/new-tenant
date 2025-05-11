"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell, Volume2, VolumeX } from "lucide-react"

interface AudioPermissionDialogProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export function AudioPermissionDialog({ onPermissionGranted, onPermissionDenied }: AudioPermissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [audioTested, setAudioTested] = useState(false)
  const [testStatus, setTestStatus] = useState("")

  // Mostrar el diálogo solo si no se ha tomado una decisión previa
  useEffect(() => {
    const hasPermission = localStorage.getItem("audioNotificationsPermission")
    if (hasPermission === null) {
      setOpen(true)
    } else if (hasPermission === "granted") {
      onPermissionGranted()
    } else {
      onPermissionDenied()
    }
  }, [onPermissionGranted, onPermissionDenied])

  const testAudio = () => {
    try {
      // Crear un audio temporal para la prueba
      const testAudio = new Audio("/sounds/new-order.mp3")

      // Configurar eventos
      testAudio.oncanplaythrough = () => {
        testAudio
          .play()
          .then(() => {
            setTestStatus("¡Audio reproducido correctamente!")
            setAudioTested(true)
          })
          .catch((err) => {
            console.error("Error en prueba de audio:", err)
            setTestStatus("No se pudo reproducir el audio. Por favor, intenta de nuevo.")
          })
      }

      testAudio.onerror = () => {
        setTestStatus("Error al cargar el audio. Verifica que tu navegador permita audio.")
      }

      // Iniciar carga
      testAudio.load()
    } catch (err) {
      console.error("Error al probar audio:", err)
      setTestStatus("Error al probar el audio")
    }
  }

  const handlePermissionGranted = () => {
    localStorage.setItem("audioNotificationsPermission", "granted")
    setOpen(false)
    onPermissionGranted()
  }

  const handlePermissionDenied = () => {
    localStorage.setItem("audioNotificationsPermission", "denied")
    setOpen(false)
    onPermissionDenied()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Permitir notificaciones de audio</DialogTitle>
          <DialogDescription>
            Para recibir alertas sonoras cuando lleguen nuevos pedidos, necesitamos tu permiso para reproducir audio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-center space-x-2">
            <Bell className="h-8 w-8 text-primary" />
            <Volume2 className="h-8 w-8 text-primary" />
          </div>

          <p className="text-sm text-center">
            Los navegadores requieren interacción del usuario antes de permitir la reproducción de audio. Prueba el
            sonido para verificar que funciona correctamente.
          </p>

          <div className="flex flex-col items-center space-y-2">
            <Button onClick={testAudio} variant="outline" className="w-full">
              Probar sonido de notificación
            </Button>
            {testStatus && (
              <p className={`text-sm ${testStatus.includes("correctamente") ? "text-green-600" : "text-red-600"}`}>
                {testStatus}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handlePermissionDenied} className="mb-2 sm:mb-0">
            <VolumeX className="mr-2 h-4 w-4" />
            No permitir
          </Button>
          <Button onClick={handlePermissionGranted} disabled={!audioTested}>
            <Volume2 className="mr-2 h-4 w-4" />
            Permitir notificaciones de audio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
