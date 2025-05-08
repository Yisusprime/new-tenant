"use client"

import { ProfileForm } from "@/components/profile/profile-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { AuthDebug } from "@/components/auth-debug"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user, loading, error } = useAuth()
  const router = useRouter()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add debug information
  console.log("Profile page auth state:", { user: user?.uid, loading, tenantId, error })

  useEffect(() => {
    if (!user && !loading && !error) {
      // Add a delay before redirecting to allow debugging
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(`/tenant/${tenantId}/login`)
      }, 5000)

      return () => {
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current)
        }
      }
    }
  }, [router, tenantId, user, loading, error])

  // If there's an auth error, show it
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de autenticación</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{error}</p>
            <p>Intenta recargar la página o iniciar sesión nuevamente.</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => window.location.reload()}>Recargar página</Button>
              <Button variant="outline" onClick={() => router.push(`/tenant/${tenantId}/login`)}>
                Iniciar sesión
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <AuthDebug />
      </div>
    )
  }

  // If loading, show a loading indicator
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando información del usuario...</p>
        </div>

        <AuthDebug />
      </div>
    )
  }

  // If no user after loading is complete, redirect to login
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No has iniciado sesión</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Debes iniciar sesión para ver tu perfil.</p>
            <p className="mb-2">Serás redirigido a la página de inicio de sesión en 5 segundos.</p>
            <div className="mt-4">
              <Button onClick={() => router.push(`/tenant/${tenantId}/login`)}>Iniciar sesión ahora</Button>
            </div>
          </AlertDescription>
        </Alert>

        <AuthDebug />
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

      <ProfileForm tenantId={tenantId} />
    </div>
  )
}
