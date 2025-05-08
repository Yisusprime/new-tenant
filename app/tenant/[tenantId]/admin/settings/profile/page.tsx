"use client"

import { ProfileForm } from "@/components/profile/profile-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"

export default function ProfilePage() {
  const { user, loading } = useAuth()

  // Add debug information
  console.log("Profile page auth state:", { user: user?.uid, loading })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
