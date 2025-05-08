"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/services/user-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { ProfilePhotoUpload } from "./profile-photo-upload"
import { Loader2 } from "lucide-react"

export function ProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: "",
    email: "",
    photoURL: "",
    phone: "",
    position: "",
    bio: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        // Get profile from Firestore
        const userProfile = await getUserProfile(user.uid)

        // If profile exists, use it
        if (userProfile) {
          setProfile(userProfile)
        } else {
          // Otherwise, use data from Firebase Auth
          setProfile({
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          })
        }
      } catch (err) {
        console.error("Error loading profile:", err)
        setError("No se pudo cargar el perfil")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setSaving(true)
      setError(null)

      await updateUserProfile(user.uid, profile)

      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado correctamente",
      })
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("No se pudo guardar el perfil")
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpdated = (url: string | null) => {
    setProfile((prev) => ({ ...prev, photoURL: url }))
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Debes iniciar sesión para ver tu perfil</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Sube una foto para personalizar tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {loading ? (
              <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <ProfilePhotoUpload userId={user.uid} photoURL={profile.photoURL} onPhotoUpdated={handlePhotoUpdated} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualiza tu información de contacto y perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="displayName">Nombre completo</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={profile.displayName || ""}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email || ""}
                  disabled={true}
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone || ""}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={profile.position || ""}
                  onChange={handleChange}
                  disabled={loading || saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  disabled={loading || saving}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={loading || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
