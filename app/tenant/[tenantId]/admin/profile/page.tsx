"use client"

import type React from "react"

import { useState } from "react"
import { useProfile } from "@/lib/context/profile-context"
import { useAuth } from "@/lib/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, User } from "lucide-react"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user } = useAuth()
  const { profile, isLoading, error, updateProfile } = useProfile()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    phoneNumber: profile?.phoneNumber || "",
    position: profile?.position || "",
    bio: profile?.bio || "",
  })

  // Actualizar el formulario cuando se cargue el perfil
  useState(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        phoneNumber: profile.phoneNumber || "",
        position: profile.position || "",
        bio: profile.bio || "",
      })
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateProfile(formData)
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil de Usuario</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre completo</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Tu cargo en la empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti"
                  rows={4}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="profile-form" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-24 w-24">
                {profile?.photoURL ? (
                  <AvatarImage
                    src={profile.photoURL || "/placeholder.svg"}
                    alt={profile.displayName || user?.email || "Usuario"}
                  />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {(profile?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium text-lg">{profile?.displayName || "Usuario"}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {profile?.position && <p className="text-sm text-gray-500">{profile.position}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID de Usuario:</span>
                <span className="font-medium">{user?.uid.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tenant:</span>
                <span className="font-medium">{tenantId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cuenta creada:</span>
                <span className="font-medium">
                  {user?.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "Desconocido"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" disabled className="w-full">
              <User className="mr-2 h-4 w-4" />
              Cambiar Foto de Perfil (Próximamente)
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
