"use client"

import { useState } from "react"
import type { User } from "firebase/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProfileSecurityProps {
  user: User
}

export function ProfileSecurity({ user }: ProfileSecurityProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleSendVerificationEmail = async () => {
    try {
      await user.sendEmailVerification()
      setIsDialogOpen(false)
      toast({
        title: "Email enviado",
        description: "Se ha enviado un correo de verificación a tu dirección de email",
      })
    } catch (error) {
      console.error("Error al enviar email de verificación:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el email de verificación",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad de la cuenta
          </CardTitle>
          <CardDescription>Información sobre la seguridad de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Verificación de email</h4>
                <p className="text-sm text-gray-500">
                  {user.emailVerified ? "Tu email está verificado" : "Tu email no está verificado"}
                </p>
              </div>
              {!user.emailVerified && (
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                  Verificar email
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Último inicio de sesión</h4>
                <p className="text-sm text-gray-500">
                  {user.metadata.lastSignInTime
                    ? new Date(user.metadata.lastSignInTime).toLocaleString()
                    : "No disponible"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Cuenta creada</h4>
                <p className="text-sm text-gray-500">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : "No disponible"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de verificación de email */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Verificar email
            </DialogTitle>
            <DialogDescription>
              Se enviará un correo de verificación a tu dirección de email: {user.email}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendVerificationEmail}>Enviar email de verificación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
