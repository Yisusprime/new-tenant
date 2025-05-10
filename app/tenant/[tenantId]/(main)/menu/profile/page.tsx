"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile, updateUserProfile, uploadProfileImage, type UserProfile } from "@/lib/services/profile-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, ArrowLeft, LogOut } from "lucide-react"
import { MobileNavigation } from "../components/mobile-navigation"
import { auth } from "@/lib/firebase/client"

export default function CustomerProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [user, setUser] = useState(auth.currentUser)
  const router = useRouter()
  const { toast } = useToast()

  // Form states
  const [personalForm, setPersonalForm] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
  })

  const [preferencesForm, setPreferencesForm] = useState({
    notifications: true,
  })

  // Check authentication and load profile
  useEffect(() => {
    console.log("Profile page: Checking auth state")

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Profile page: Forcing loading state to complete after timeout")
      setLoading(false)

      // If no user after timeout, redirect to login
      if (!auth.currentUser) {
        console.log("Profile page: No user after timeout, redirecting to login")
        router.push(`/tenant/${tenantId}/menu/login`)
      }
    }, 3000)

    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      console.log("Profile page: Auth state changed", authUser ? "User logged in" : "No user")

      if (!authUser) {
        console.log("Profile page: No user, redirecting to login")
        router.push(`/tenant/${tenantId}/menu/login`)
        return
      }

      setUser(authUser)

      try {
        console.log("Profile page: Loading user profile")
        const userProfile = await getUserProfile(tenantId, authUser.uid)
        console.log("Profile page: User profile loaded", userProfile)

        if (userProfile) {
          setProfile(userProfile)

          // Initialize forms with existing data
          setPersonalForm({
            displayName: userProfile.displayName || "",
            phoneNumber: userProfile.phoneNumber || "",
            address: userProfile.address || "",
          })

          setPreferencesForm({
            notifications: userProfile.preferences?.notifications !== false,
          })
        } else {
          // Initialize with Firebase Auth user data
          setPersonalForm((prev) => ({
            ...prev,
            displayName: authUser.displayName || "",
            phoneNumber: authUser.phoneNumber || "",
          }))
        }
      } catch (error) {
        console.error("Profile page: Error loading profile:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [tenantId, router, toast])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      console.log("Profile page: Updating user profile")
      await updateUserProfile(tenantId, user.uid, {
        displayName: personalForm.displayName,
        phoneNumber: personalForm.phoneNumber,
        address: personalForm.address,
      })
      console.log("Profile page: Profile updated successfully")

      toast({
        title: "Perfil actualizado",
        description: "La información personal se ha actualizado correctamente",
      })

      // Reload profile
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Profile page: Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información personal",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      console.log("Profile page: Updating user preferences")
      await updateUserProfile(tenantId, user.uid, {
        preferences: {
          notifications: preferencesForm.notifications,
          // Preserve other preferences if they exist
          ...(profile?.preferences || {}),
          notifications: preferencesForm.notifications,
        },
      })
      console.log("Profile page: Preferences updated successfully")

      toast({
        title: "Preferencias actualizadas",
        description: "Las preferencias se han actualizado correctamente",
      })

      // Reload profile
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Profile page: Error updating preferences:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingImage(true)
      console.log("Profile page: Uploading profile image")
      const photoURL = await uploadProfileImage(tenantId, user.uid, file)
      console.log("Profile page: Image uploaded successfully")

      // Update local profile
      setProfile((prev) => (prev ? { ...prev, photoURL } : null))

      toast({
        title: "Imagen actualizada",
        description: "La imagen de perfil se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Profile page: Error uploading image:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen de perfil",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Clear file input
      e.target.value = ""
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("Profile page: Signing out")
      await auth.signOut()
      console.log("Profile page: Signed out successfully")
      router.push(`/tenant/${tenantId}/menu`)
    } catch (error) {
      console.error("Profile page: Error signing out:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500">Cargando perfil...</p>
          </div>
        </div>
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>
    )
  }

  if (!user) {
    // This should not happen due to the redirect in useEffect
    // But just in case, we'll handle it here too
    console.log("Profile page: No user in render, redirecting to login")
    router.push(`/tenant/${tenantId}/menu/login`)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push(`/tenant/${tenantId}/menu`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Mi Cuenta</CardTitle>
              <CardDescription>Información personal y preferencias</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.photoURL || ""} alt={personalForm.displayName} />
                  <AvatarFallback className="text-2xl">
                    {personalForm.displayName
                      ? personalForm.displayName.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {uploadingImage ? (
                  <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              <div className="w-full space-y-2 text-center">
                <p className="font-medium text-lg">{personalForm.displayName || "Sin nombre"}</p>
                <p className="text-gray-500">{user?.email}</p>
                {personalForm.phoneNumber && <p className="text-gray-500">{personalForm.phoneNumber}</p>}
              </div>

              <Button variant="outline" className="mt-6 w-full" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>

          {/* Forms */}
          <div className="md:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Información Personal</TabsTrigger>
                <TabsTrigger value="preferences">Preferencias</TabsTrigger>
              </TabsList>

              {/* Personal information tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="personal-form" onSubmit={handlePersonalSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre completo</Label>
                        <Input
                          id="displayName"
                          value={personalForm.displayName}
                          onChange={(e) => setPersonalForm({ ...personalForm, displayName: e.target.value })}
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Teléfono</Label>
                        <Input
                          id="phoneNumber"
                          value={personalForm.phoneNumber}
                          onChange={(e) => setPersonalForm({ ...personalForm, phoneNumber: e.target.value })}
                          placeholder="Tu número de teléfono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección de entrega</Label>
                        <Textarea
                          id="address"
                          value={personalForm.address}
                          onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                          placeholder="Tu dirección para entregas"
                          rows={3}
                        />
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" form="personal-form" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Preferences tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferencias</CardTitle>
                    <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form id="preferences-form" onSubmit={handlePreferencesSubmit} className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="notifications"
                          checked={preferencesForm.notifications}
                          onChange={(e) => setPreferencesForm({ ...preferencesForm, notifications: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="notifications" className="cursor-pointer">
                          Recibir notificaciones sobre promociones y novedades
                        </Label>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit" form="preferences-form" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
