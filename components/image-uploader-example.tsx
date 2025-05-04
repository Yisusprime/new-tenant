"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload } from "lucide-react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"

export function ImageUploaderExample() {
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo de imagen válido.",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es demasiado grande. El tamaño máximo es de 5MB.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)

      // 1. Crear una referencia única para el archivo
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`
      const fileRef = ref(storage, `uploads/${fileName}`)

      // 2. Subir el archivo a Firebase Storage
      const snapshot = await uploadBytes(fileRef, file)

      // 3. Obtener la URL de descarga
      const downloadUrl = await getDownloadURL(snapshot.ref)

      // 4. Guardar la URL (en este ejemplo solo la mostramos)
      setImageUrl(downloadUrl)

      toast({
        title: "Éxito",
        description: "La imagen se ha subido correctamente.",
      })
    } catch (error) {
      console.error("Error al subir imagen:", error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h2 className="text-lg font-medium">Subir Imagen</h2>

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

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Imagen subida:</p>
          <div className="relative h-48 w-full max-w-md border rounded-md overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl || "/placeholder.svg"} alt="Imagen subida" className="object-contain w-full h-full" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 break-all">URL: {imageUrl}</p>
        </div>
      )}
    </div>
  )
}
