"use client"

import type React from "react"

import { useState, useRef } from "react"
import { User, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadProfilePhoto, deleteProfilePhoto } from "@/lib/services/profile-service"
import { useToast } from "@/components/ui/use-toast"

interface ProfilePhotoUploadProps {
  userId: string
  photoURL?: string
  onPhotoUpdated: (url: string) => void
}

export function ProfilePhotoUpload({ userId, photoURL, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Por favor, selecciona una imagen (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)
      const downloadURL = await uploadProfilePhoto(userId, file)
      onPhotoUpdated(downloadURL)
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la foto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDeletePhoto = async () => {
    if (!photoURL) return

    try {
      setIsDeleting(true)
      await deleteProfilePhoto(userId)
      onPhotoUpdated("")
      toast({
        title: "Foto eliminada",
        description: "Tu foto de perfil ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {photoURL ? (
            <img src={photoURL || "/placeholder.svg"} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
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
          <Upload className="mr-2 h-4 w-4" />
          Subir foto
        </Button>

        {photoURL && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDeletePhoto}
            disabled={isUploading || isDeleting}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  )
}
