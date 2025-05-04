"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface StartShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  tenantId: string
}

export function StartShiftDialog({ open, onOpenChange, onComplete, tenantId }: StartShiftDialogProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartShift = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // 1. Verificar si hay una sesión de caja abierta
      // En una implementación real, verificaríamos con Firebase
      const hasCashierSession = false // Simulamos que no hay sesión abierta

      if (!hasCashierSession) {
        // 2. Si no hay sesión de caja, redirigir a abrir caja
        setSuccess(true)

        // Esperar un momento para mostrar el mensaje de éxito
        setTimeout(() => {
          onOpenChange(false)
          onComplete()
          router.push(`/admin/cashier?action=open`)
        }, 1500)
      } else {
        // 3. Si ya hay una sesión, simplemente iniciar turno
        setSuccess(true)

        setTimeout(() => {
          onOpenChange(false)
          onComplete()
        }, 1500)
      }
    } catch (error) {
      console.error("Error al iniciar turno:", error)
      setError("Ha ocurrido un error al iniciar el turno. Por favor, inténtalo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isProcessing) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Turno</DialogTitle>
          <DialogDescription>Inicia un nuevo turno para comenzar a recibir pedidos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Turno iniciado correctamente. Redirigiendo...</AlertDescription>
            </Alert>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p>Al iniciar el turno:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Se verificará si hay una sesión de caja abierta</li>
                <li>Si no hay sesión abierta, serás redirigido para abrir caja</li>
                <li>Podrás comenzar a recibir y procesar pedidos</li>
              </ul>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing || success}>
            Cancelar
          </Button>
          <Button
            onClick={handleStartShift}
            disabled={isProcessing || success}
            className={isProcessing ? "opacity-80" : ""}
          >
            {isProcessing ? "Procesando..." : "Iniciar Turno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
