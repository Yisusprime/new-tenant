"use client"

import type React from "react"

import { useState, useRef } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadProfilePhoto, deleteProfilePhoto } from "@/lib/services/user-service"
import { useToast } from "@/components/ui/use-toast"

interface ProfilePhotoUploadProps {
  userId: string
  photoURL?: string | null
  onPhotoUpdated: (url: string | null) => void
}

export function ProfilePhotoUpload({ userId, photoURL, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const url = await uploadProfilePhoto(userId, file)
      onPhotoUpdated(url)
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!photoURL) return

    try {
      setIsDeleting(true)
      await deleteProfilePhoto(userId)
      onPhotoUpdated(null)
      toast({
        title: "Foto eliminada",
        description: "Tu foto de perfil ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {photoURL ? (
            <img src={photoURL || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-16 w-16 text-gray-400" />
          )}
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
        >
          {photoURL ? "Cambiar foto" : "Subir foto"}
        </Button>
        {photoURL && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeletePhoto}
            disabled={isUploading || isDeleting}
          >
            Eliminar
          </Button>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  )
}
