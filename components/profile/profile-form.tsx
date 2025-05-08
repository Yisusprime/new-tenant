"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/services/profile-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfilePhotoUpload } from "./profile-photo-upload"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    position: "",
    address: "",
    photoURL: "",
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        console.log("No user found in auth context")
        return
      }

      console.log("Loading profile for user:", user.uid)

      try {
        setLoading(true)
        const userProfile = await getUserProfile(user.uid)

        if (userProfile) {
          setProfile(userProfile)
        } else {
          // Initialize with data from Firebase Auth if available
          setProfile({
            displayName: user.displayName || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            photoURL: user.photoURL || "",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsSaving(true)
      await updateUserProfile(user.uid, profile)
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpdated = (url: string) => {
    setProfile((prev) => ({ ...prev, photoURL: url }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Debes iniciar sesión para ver tu perfil</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil de Usuario</CardTitle>
        <CardDescription>Actualiza tu información personal y foto de perfil</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-6">
            <ProfilePhotoUpload userId={user.uid} photoURL={profile.photoURL} onPhotoUpdated={handlePhotoUpdated} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre completo</Label>
              <Input
                id="displayName"
                name="displayName"
                value={profile.displayName || ""}
                onChange={handleChange}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email || ""}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={profile.phoneNumber || ""}
                onChange={handleChange}
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo / Posición</Label>
              <Input
                id="position"
                name="position"
                value={profile.position || ""}
                onChange={handleChange}
                placeholder="Tu cargo o posición"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                placeholder="Tu dirección"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
                placeholder="Cuéntanos un poco sobre ti"
                rows={4}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
