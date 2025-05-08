"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile/profile-form"
import { useAuth } from "@/lib/context/auth-context"
import { Loader2 } from "lucide-react"

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configuración de Perfil</h1>
        <p className="text-gray-500 mt-1">Administra tu información personal y preferencias</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
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
      )}
    </div>
  )
}
