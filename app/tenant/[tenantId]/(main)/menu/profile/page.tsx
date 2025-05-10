"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
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
import { DesktopNavigation } from "../components/desktop-navigation"
import { MobileNavigation } from "../components/mobile-navigation"

export default function CustomerProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user, signOut, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
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

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(`/tenant/${tenantId}/menu/login`)
      return
    }

    async function loadProfile() {
      try {
        setLoading(true)
        const userProfile = await getUserProfile(tenantId, user.uid)

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
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
          }))
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
  }, [user, authLoading, tenantId, router, toast])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)

      await updateUserProfile(tenantId, user.uid, {
        displayName: personalForm.displayName,
        phoneNumber: personalForm.phoneNumber,
        address: personalForm.address,
      })

      toast({
        title: "Perfil actualizado",
        description: "La información personal se ha actualizado correctamente",
      })

      // Reload profile
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating profile:", error)
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

      await updateUserProfile(tenantId, user.uid, {
        preferences: {
          notifications: preferencesForm.notifications,
          // Preserve other preferences if they exist
          ...(profile?.preferences || {}),
          notifications: preferencesForm.notifications,
        },
      })

      toast({
        title: "Preferencias actualizadas",
        description: "Las preferencias se han actualizado correctamente",
      })

      // Reload profile
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Error updating preferences:", error)
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

      const photoURL = await uploadProfileImage(tenantId, user.uid, file)

      // Update local profile
      setProfile((prev) => (prev ? { ...prev, photoURL } : null))

      toast({
        title: "Imagen actualizada",
        description: "La imagen de perfil se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
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
      await signOut()
      router.push(`/tenant/${tenantId}/menu`)
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DesktopNavigation />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopNavigation />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
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
