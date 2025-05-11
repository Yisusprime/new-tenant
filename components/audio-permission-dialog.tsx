"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Bell, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AudioPermissionDialogProps {
  onPermissionGranted: () => void
  onPermissionDenied: () => void
  onVisualOnly: () => void
}

export function AudioPermissionDialog({
  onPermissionGranted,
  onPermissionDenied,
  onVisualOnly,
}: AudioPermissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [audioTested, setAudioTested] = useState(false)
  const [testStatus, setTestStatus] = useState("")
  const [testAttempts, setTestAttempts] = useState(0)
  const [bypassTesting, setBypassTesting] = useState(false)
  const [activeTab, setActiveTab] = useState("audio")

  // Mostrar el diálogo solo si no se ha tomado una decisión previa
  useEffect(() => {
    const hasPermission = localStorage.getItem("notificationsPermission")
    if (hasPermission === null) {
      setOpen(true)
    } else if (hasPermission === "audio") {
      onPermissionGranted()
    } else if (hasPermission === "visual") {
      onVisualOnly()
    } else {
      onPermissionDenied()
    }
  }, [onPermissionGranted, onPermissionDenied, onVisualOnly])

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
            if (testAttempts >= 1) {
              setBypassTesting(true)
            }
          })
      }

      testAudio.onerror = (e) => {
        console.error("Error detallado:", e)
        setTestStatus("Error al cargar el audio. Verifica que tu navegador permita audio.")

        // Si hay varios intentos fallidos, ofrecer bypass
        if (testAttempts >= 1) {
          setBypassTesting(true)
        }
      }

      // Iniciar carga
      testAudio.load()
    } catch (err) {
      console.error("Error al probar audio:", err)
      setTestStatus("Error al probar el audio")

      // Si hay varios intentos fallidos, ofrecer bypass
      if (testAttempts >= 1) {
        setBypassTesting(true)
      }
    }
  }

  const handleAudioPermissionGranted = () => {
    localStorage.setItem("notificationsPermission", "audio")
    setOpen(false)
    onPermissionGranted()
  }

  const handlePermissionDenied = () => {
    localStorage.setItem("notificationsPermission", "denied")
    setOpen(false)
    onPermissionDenied()
  }

  const handleVisualOnly = () => {
    localStorage.setItem("notificationsPermission", "visual")
    setOpen(false)
    onVisualOnly()
  }

  const handleBypass = () => {
    setAudioTested(true)
    setTestStatus("Verificación de audio omitida. Las notificaciones podrían no funcionar correctamente.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar notificaciones</DialogTitle>
          <DialogDescription>
            Elige cómo quieres recibir notificaciones cuando lleguen nuevos pedidos.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audio">Notificaciones con sonido</TabsTrigger>
            <TabsTrigger value="visual">Solo notificaciones visuales</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4 py-4">
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

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handlePermissionDenied}>
                <VolumeX className="mr-2 h-4 w-4" />
                No permitir
              </Button>
              <Button
                onClick={handleAudioPermissionGranted}
                disabled={!audioTested}
                className={!audioTested ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Permitir notificaciones con sonido
              </Button>
            </div>

            {!audioTested && testStatus && testStatus.includes("Error") && (
              <div className="text-sm text-center text-red-600 mt-2">
                <p>Si continúas teniendo problemas con el audio:</p>
                <ul className="list-disc list-inside text-xs mt-1">
                  <li>Verifica que tu navegador tenga permisos para reproducir audio</li>
                  <li>Comprueba que el volumen de tu dispositivo esté activado</li>
                  <li>Prueba con otro navegador</li>
                  <li>O elige "Solo notificaciones visuales" en la pestaña superior</li>
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="visual" className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <Bell className="h-12 w-12 text-primary" />
            </div>

            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Con esta opción, recibirás notificaciones visuales en la pantalla cuando lleguen nuevos pedidos, sin
                sonidos.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handlePermissionDenied}>
                No permitir
              </Button>
              <Button onClick={handleVisualOnly}>
                <Bell className="mr-2 h-4 w-4" />
                Usar solo notificaciones visuales
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
