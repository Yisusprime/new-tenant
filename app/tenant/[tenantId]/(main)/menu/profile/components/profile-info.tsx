"use client"

import type React from "react"

import { useState } from "react"
import { updateUserProfile, uploadProfileImage } from "@/lib/services/profile-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

interface ProfileInfoProps {
  user: any
  profile: any
  tenantId: string
}

export function ProfileInfo({ user, profile, tenantId }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || user?.displayName || "",
    phoneNumber: profile?.phoneNumber || user?.phoneNumber || "",
    bio: profile?.bio || "",
    address: profile?.address || "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Primero actualizar la imagen si hay una nueva
      let photoURL = profile?.photoURL
      if (imageFile) {
        photoURL = await uploadProfileImage(tenantId, user.uid, imageFile)
      }

      // Luego actualizar el resto del perfil
      await updateUserProfile(tenantId, user.uid, {
        ...formData,
        photoURL,
      })

      toast.success("Perfil actualizado correctamente")
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={imagePreview || profile?.photoURL || user?.photoURL}
                alt={formData.displayName || "Usuario"}
              />
              <AvatarFallback>{(formData.displayName || user?.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {isEditing && (
              <div className="w-full">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 p-2 border border-dashed rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Cambiar foto</span>
                  </div>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
              </div>
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" value={user?.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
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
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Tu dirección"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Sobre mí</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre ti"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{profile?.displayName || user?.displayName || "Usuario"}</h2>
                  <p className="text-gray-500">{user?.email}</p>
                </div>

                {profile?.phoneNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                    <p>{profile.phoneNumber}</p>
                  </div>
                )}

                {profile?.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                    <p>{profile.address}</p>
                  </div>
                )}

                {profile?.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sobre mí</h3>
                    <p>{profile.bio}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button onClick={() => setIsEditing(true)}>Editar perfil</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
