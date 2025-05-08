"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { useAuth } from "@/lib/context/auth-context"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth()
  const [authTimeout, setAuthTimeout] = useState(false)

  // Debug log for auth state
  console.log("Auth state in ProfileSettingsPage:", { user, loading })

  // Set a timeout to detect if authentication is taking too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("Authentication is taking longer than expected")
        setAuthTimeout(true)
      }
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timer)
  }, [loading])

  // If still loading but timeout occurred, show a message with reload option
  if (loading && authTimeout) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
          <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
        </div>

        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Carga prolongada</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>La autenticación está tomando más tiempo de lo esperado.</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
          <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-500">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // If no user is available after loading, show error
  if (!user) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
          <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No autorizado</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Debes iniciar sesión para ver esta página.</p>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => (window.location.href = "/login")}>
              Ir a iniciar sesión
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
        <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="preferences">
          <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <p className="text-yellow-800">Las preferencias de usuario estarán disponibles próximamente.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
