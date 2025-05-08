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

  // Debug log for user state
  console.log("Auth state in ProfileForm:", { user, loading: loading })

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      // If no user is available, don't try to load profile
      if (!user) {
        if (isMounted) {
          console.log("No user available, skipping profile load")
          setLoading(false)
        }
        return
      }

      console.log("Loading profile for user:", user.uid)

      try {
        if (isMounted) setLoading(true)

        // Initialize with data from Firebase Auth
        if (isMounted) {
          setProfile({
            displayName: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          })
        }

        // Try to get profile from Firestore
        try {
          const userProfile = await getUserProfile(user.uid)
          console.log("Loaded user profile:", userProfile)

          // If profile exists and component is still mounted, use it
          if (userProfile && isMounted) {
            setProfile(userProfile)
          }
        } catch (profileError) {
          console.error("Error loading profile from Firestore:", profileError)
          // Continue with basic profile from auth
        }

        if (isMounted) setError(null)
      } catch (err) {
        console.error("Error in profile loading process:", err)
        if (isMounted) setError("No se pudo cargar el perfil")
      } finally {
        if (isMounted) {
          console.log("Finished loading profile, setting loading to false")
          setLoading(false)
        }
      }
    }

    loadProfile()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      console.error("Cannot save profile: No user available")
      return
    }

    try {
      setSaving(true)
      setError(null)

      await updateUserProfile(user.uid, profile)
      console.log("Profile updated successfully")

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

  // If still loading, show loading indicator
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-500">Cargando información del perfil...</p>
      </div>
    )
  }

  // If no user is available after loading, show error
  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Debes iniciar sesión para ver tu perfil. Si ya has iniciado sesión, intenta recargar la página.
        </AlertDescription>
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
            <ProfilePhotoUpload userId={user.uid} photoURL={profile.photoURL} onPhotoUpdated={handlePhotoUpdated} />
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
                  disabled={saving}
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
                <Input id="phone" name="phone" value={profile.phone || ""} onChange={handleChange} disabled={saving} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={profile.position || ""}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio || ""}
                  onChange={handleChange}
                  disabled={saving}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={saving}>
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
