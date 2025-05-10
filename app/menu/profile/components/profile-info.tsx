"use client"

import type React from "react"

import { useState } from "react"
import { updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { put } from "@vercel/blob"

export function ProfileInfo({ user, profile, tenantId }: { user: any; profile: any; tenantId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    phoneNumber: profile?.phoneNumber || "",
    address: profile?.address || "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.photoURL || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Actualizar perfil en Firebase Auth
      await updateProfile(user, {
        displayName: formData.displayName,
      })

      // Subir avatar si se seleccionó uno nuevo
      let photoURL = user.photoURL
      if (avatarFile) {
        const filename = `avatars/${user.uid}-${Date.now()}.${avatarFile.name.split(".").pop()}`
        const blob = await put(filename, avatarFile, {
          access: "public",
        })
        photoURL = blob.url
        await updateProfile(user, { photoURL })
      }

      // Actualizar perfil en Firestore
      const userProfileRef = doc(db, `tenants/${tenantId}/users/${user.uid}`)
      await setDoc(
        userProfileRef,
        {
          userId: user.uid,
          displayName: formData.displayName,
          email: user.email,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          photoURL,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar el perfil:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || ""} alt={user.displayName || "Usuario"} />
              <AvatarFallback>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <div className="flex flex-col items-center">
                <Label htmlFor="avatar" className="cursor-pointer text-primary hover:underline flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Cambiar foto
                </Label>
                <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            )}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre</Label>
                  <Input id="displayName" name="displayName" value={formData.displayName} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-100" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Teléfono</Label>
                  <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1">{user.displayName || "No especificado"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
                  <p className="mt-1">{user.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <p className="mt-1">{profile?.phoneNumber || "No especificado"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                  <p className="mt-1">{profile?.address || "No especificado"}</p>
                </div>

                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Editar Perfil
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
