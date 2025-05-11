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
import { Bell, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioPermissionDialogProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
}

export function AudioPermissionDialog({ onPermissionGranted, onPermissionDenied }: AudioPermissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [audioTested, setAudioTested] = useState(false)
  const [testStatus, setTestStatus] = useState("")
  const [testAttempts, setTestAttempts] = useState(0)
  const [bypassTesting, setBypassTesting] = useState(false)

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
      setTestAttempts((prev) => prev + 1)

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

            // Si hay varios intentos fallidos, ofrecer bypass
            if (testAttempts >= 2) {
              setBypassTesting(true)
            }
          })
      }

      testAudio.onerror = () => {
        setTestStatus("Error al cargar el audio. Verifica que tu navegador permita audio.")

        // Si hay varios intentos fallidos, ofrecer bypass
        if (testAttempts >= 2) {
          setBypassTesting(true)
        }
      }

      // Iniciar carga
      testAudio.load()
    } catch (err) {
      console.error("Error al probar audio:", err)
      setTestStatus("Error al probar el audio")

      // Si hay varios intentos fallidos, ofrecer bypass
      if (testAttempts >= 2) {
        setBypassTesting(true)
      }
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

  const handleBypass = () => {
    setAudioTested(true)
    setTestStatus("Verificación de audio omitida. Las notificaciones podrían no funcionar correctamente.")
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

          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Paso 1:</strong> Haz clic en "Probar sonido" para verificar que funciona correctamente.
              <br />
              <strong>Paso 2:</strong> Una vez que escuches el sonido, podrás hacer clic en "Permitir".
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center space-y-2">
            <Button onClick={testAudio} variant="default" className="w-full">
              <Volume2 className="mr-2 h-4 w-4" />
              Probar sonido de notificación
            </Button>
            {testStatus && (
              <p className={`text-sm ${testStatus.includes("correctamente") ? "text-green-600" : "text-red-600"}`}>
                {testStatus}
              </p>
            )}

            {bypassTesting && !audioTested && (
              <Button onClick={handleBypass} variant="link" size="sm" className="mt-2">
                Omitir verificación de audio
              </Button>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handlePermissionDenied} className="mb-2 sm:mb-0">
            <VolumeX className="mr-2 h-4 w-4" />
            No permitir
          </Button>
          <Button
            onClick={handlePermissionGranted}
            disabled={!audioTested}
            className={!audioTested ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Permitir notificaciones de audio
          </Button>
        </DialogFooter>

        {!audioTested && (
          <div className="text-xs text-center text-muted-foreground mt-2">
            El botón "Permitir" se habilitará después de probar el sonido correctamente
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
