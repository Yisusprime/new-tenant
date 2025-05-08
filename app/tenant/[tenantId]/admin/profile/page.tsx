"use client"

import { useState } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { ProfileAvatar } from "@/components/profile/profile-avatar"
import { ProfileForm } from "@/components/profile/profile-form"
import { ProfileSecurity } from "@/components/profile/profile-security"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user, loading } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  // Función para forzar la actualización de los componentes
  const handleProfileUpdate = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-col items-center mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48 mt-4" />
        </div>

        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Debes iniciar sesión para ver esta página</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Administra tu información personal y configuración de cuenta</p>
      </div>

      <div className="flex flex-col items-center mb-8">
        <ProfileAvatar key={`avatar-${refreshKey}`} user={user} onUpdate={handleProfileUpdate} />
        <h2 className="text-xl font-semibold mt-4">{user.displayName || user.email}</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <ProfileForm key={`form-${refreshKey}`} user={user} tenantId={tenantId} onUpdate={handleProfileUpdate} />
        </div>

        <div>
          <ProfileSecurity key={`security-${refreshKey}`} user={user} />
        </div>
      </div>
    </div>
  )
}
