"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { getUserProfile, updateUserProfile, uploadProfileImage, type UserProfile } from "@/lib/services/profile-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, User, Mail, Phone, Briefcase, MapPin, Globe, Trash } from "lucide-react"

export default function ProfilePage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Formulario para datos personales
  const [personalForm, setPersonalForm] = useState({
    displayName: "",
    phoneNumber: "",
    position: "",
    bio: "",
    address: "",
  })

  // Formulario para redes sociales
  const [socialForm, setSocialForm] = useState({
    website: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  })

  // Formulario para preferencias
  const [preferencesForm, setPreferencesForm] = useState({
    notifications: true,
    darkMode: false,
    language: "es",
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        setLoading(true)
        const userProfile = await getUserProfile(tenantId, user.uid)

        if (userProfile) {
          setProfile(userProfile)

          // Inicializar formularios con datos existentes
          setPersonalForm({
            displayName: userProfile.displayName || "",
            phoneNumber: userProfile.phoneNumber || "",
            position: userProfile.position || "",
            bio: userProfile.bio || "",
            address: userProfile.address || "",
          })

          setSocialForm({
            website: userProfile.socialLinks?.website || "",
            linkedin: userProfile.socialLinks?.linkedin || "",
            twitter: userProfile.socialLinks?.twitter || "",
            instagram: userProfile.socialLinks?.instagram || "",
          })

          setPreferencesForm({
            notifications: userProfile.preferences?.notifications !== false,
            darkMode: userProfile.preferences?.darkMode === true,
            language: userProfile.preferences?.language || "es",
          })
        } else {
          // Inicializar con datos del usuario de Firebase Auth
          setPersonalForm((prev) => ({
            ...prev,
            displayName: user.displayName || "",
            phoneNumber: user.phoneNumber || "",
          }))
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error)
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
  }, [user, tenantId, toast])

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)

      await updateUserProfile(tenantId, user.uid, {
        displayName: personalForm.displayName,
        phoneNumber: personalForm.phoneNumber,
        position: personalForm.position,
        bio: personalForm.bio,
        address: personalForm.address,
      })

      toast({
        title: "Perfil actualizado",
        description: "La información personal se ha actualizado correctamente",
      })

      // Recargar el perfil
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la información personal",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)

      await updateUserProfile(tenantId, user.uid, {
        socialLinks: {
          website: socialForm.website,
          linkedin: socialForm.linkedin,
          twitter: socialForm.twitter,
          instagram: socialForm.instagram,
        },
      })

      toast({
        title: "Redes sociales actualizadas",
        description: "Los enlaces de redes sociales se han actualizado correctamente",
      })

      // Recargar el perfil
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Error al actualizar redes sociales:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los enlaces de redes sociales",
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
          darkMode: preferencesForm.darkMode,
          language: preferencesForm.language,
        },
      })

      toast({
        title: "Preferencias actualizadas",
        description: "Las preferencias se han actualizado correctamente",
      })

      // Recargar el perfil
      const updatedProfile = await getUserProfile(tenantId, user.uid)
      if (updatedProfile) setProfile(updatedProfile)
    } catch (error) {
      console.error("Error al actualizar preferencias:", error)
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

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
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

      // Actualizar el perfil local
      setProfile((prev) => (prev ? { ...prev, photoURL } : null))

      toast({
        title: "Imagen actualizada",
        description: "La imagen de perfil se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen de perfil",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteImage = async () => {
    if (!user || !profile?.photoURL) return

    try {
      setUploadingImage(true)

      // Implementar la función para eliminar la imagen
      // await deleteProfileImage(tenantId, user.uid)

      // Por ahora, simplemente actualizamos el perfil sin la URL
      await updateUserProfile(tenantId, user.uid, {
        photoURL: "",
      })

      // Actualizar el perfil local
      setProfile((prev) => (prev ? { ...prev, photoURL: "" } : null))

      toast({
        title: "Imagen eliminada",
        description: "La imagen de perfil se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen de perfil",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de perfil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>Tu información personal y de contacto</CardDescription>
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
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </div>

            {profile?.photoURL && (
              <Button
                variant="outline"
                size="sm"
                className="mb-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleDeleteImage}
                disabled={uploadingImage}
              >
                <Trash className="h-4 w-4 mr-2" />
                Eliminar foto
              </Button>
            )}

            <div className="w-full space-y-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">{personalForm.displayName || "Sin nombre"}</span>
              </div>

              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>{user?.email}</span>
              </div>

              {personalForm.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{personalForm.phoneNumber}</span>
                </div>
              )}

              {personalForm.position && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{personalForm.position}</span>
                </div>
              )}

              {personalForm.address && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                  <span>{personalForm.address}</span>
                </div>
              )}

              {socialForm.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  <a
                    href={socialForm.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {socialForm.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formularios */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Información Personal</TabsTrigger>
              <TabsTrigger value="social">Redes Sociales</TabsTrigger>
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            </TabsList>

            {/* Pestaña de información personal */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="personal-form" onSubmit={handlePersonalSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        value={personalForm.position}
                        onChange={(e) => setPersonalForm({ ...personalForm, position: e.target.value })}
                        placeholder="Tu cargo en la empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={personalForm.bio}
                        onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                        placeholder="Cuéntanos sobre ti"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Textarea
                        id="address"
                        value={personalForm.address}
                        onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                        placeholder="Tu dirección"
                        rows={2}
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

            {/* Pestaña de redes sociales */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociales</CardTitle>
                  <CardDescription>Añade enlaces a tus perfiles en redes sociales</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="social-form" onSubmit={handleSocialSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio web</Label>
                      <Input
                        id="website"
                        value={socialForm.website}
                        onChange={(e) => setSocialForm({ ...socialForm, website: e.target.value })}
                        placeholder="https://tusitio.com"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={socialForm.linkedin}
                        onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/tuusuario"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={socialForm.twitter}
                        onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                        placeholder="https://twitter.com/tuusuario"
                        type="url"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/tuusuario"
                        type="url"
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" form="social-form" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Guardar Cambios
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Pestaña de preferencias */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                  <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="preferences-form" onSubmit={handlePreferencesSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Notificaciones</Label>
                        <p className="text-sm text-muted-foreground">Recibir notificaciones por email</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={preferencesForm.notifications}
                        onCheckedChange={(checked) =>
                          setPreferencesForm({ ...preferencesForm, notifications: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">Modo oscuro</Label>
                        <p className="text-sm text-muted-foreground">Usar tema oscuro en la interfaz</p>
                      </div>
                      <Switch
                        id="darkMode"
                        checked={preferencesForm.darkMode}
                        onCheckedChange={(checked) => setPreferencesForm({ ...preferencesForm, darkMode: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <select
                        id="language"
                        value={preferencesForm.language}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
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
  )
}
