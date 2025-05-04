"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { uploadFileToStorage } from "@/lib/firebase-storage-helper"
import Image from "next/image"

interface ImprovedImageUploaderProps {
  onImageUploaded?: (url: string) => void
  folder?: string
  maxSizeMB?: number
}

export function ImprovedImageUploader({
  onImageUploaded,
  folder = "uploads",
  maxSizeMB = 5,
}: ImprovedImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limpiar error anterior
    setError(null)

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido.")
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo de imagen válido.",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`La imagen es demasiado grande. El tamaño máximo es de ${maxSizeMB}MB.`)
      toast({
        title: "Error",
        description: `La imagen es demasiado grande. El tamaño máximo es de ${maxSizeMB}MB.`,
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // Crear una vista previa local mientras se sube
      const reader = new FileReader()
      reader.onload = (e) => {
        // Esta es solo una vista previa local, no la URL final
        const previewUrl = e.target?.result as string
        setImageUrl(previewUrl)
      }
      reader.readAsDataURL(file)

      // Subir el archivo usando nuestro helper
      const result = await uploadFileToStorage(file, folder)

      if (result.success && result.url) {
        // Actualizar con la URL real de Firebase
        setImageUrl(result.url)

        // Notificar al componente padre si existe la función
        if (onImageUploaded) {
          onImageUploaded(result.url)
        }

        toast({
          title: "Éxito",
          description: "La imagen se ha subido correctamente.",
        })
      } else {
        setError(result.error || "Error al subir la imagen")
        toast({
          title: "Error",
          description: result.error || "Error al subir la imagen",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al subir imagen:", error)
      setError("Error inesperado al subir la imagen")
      toast({
        title: "Error",
        description: "Error inesperado al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          ref={fileInputRef}
          className="max-w-xs"
        />

        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Subir
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {imageUrl && !error && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Imagen:</p>
          <div className="relative h-48 w-full max-w-md border rounded-md overflow-hidden">
            <Image src={imageUrl || "/placeholder.svg"} alt="Imagen subida" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
