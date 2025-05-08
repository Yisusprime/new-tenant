"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { storage } from "@/lib/firebase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProfileAvatarProps {
  user: User
  onUpdate: () => void
}

export function ProfileAvatar({ user, onUpdate }: ProfileAvatarProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Crear una referencia al archivo en Firebase Storage
      const storageRef = ref(storage, `users/${user.uid}/avatar`)

      // Subir el archivo
      await uploadBytes(storageRef, file)

      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(storageRef)

      // Actualizar el perfil del usuario
      await updateProfile(user, {
        photoURL: downloadURL,
      })

      // Notificar al componente padre que se actualizó el perfil
      onUpdate()

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "Usuario"} />
          <AvatarFallback className="text-2xl">
            {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
