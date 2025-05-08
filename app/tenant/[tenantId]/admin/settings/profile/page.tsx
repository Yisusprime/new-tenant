"use client"

import { ProfileForm } from "@/components/profile/profile-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>
          Tu información de perfil será visible para otros usuarios del sistema según su nivel de acceso.
        </AlertDescription>
      </Alert>

      <ProfileForm />
    </div>
  )
}
