"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  currentImageUrl: string
  onImageUploaded: (url: string) => void
  folder: string
  tenantId?: string // Añadimos el tenantId como prop opcional
}

export function ImageUpload({ currentImageUrl, onImageUploaded, folder, tenantId }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [localTenantId, setLocalTenantId] = useState<string | null>(tenantId || null)

  // Si no se proporciona tenantId, intentamos obtenerlo del hostname
  useEffect(() => {
    if (!tenantId) {
      const hostname = window.location.hostname
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

      if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
        const subdomain = hostname.replace(`.${rootDomain}`, "")
        setLocalTenantId(subdomain)
      }
    }
  }, [tenantId])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Crear una vista previa local
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("file", file)

      // Incluir el tenantId en la ruta de la carpeta
      const folderPath = localTenantId ? `${localTenantId}/${folder}` : folder
      formData.append("folder", folderPath)

      // Enviar el archivo a nuestro endpoint de API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.url) {
        // Actualizar con la URL real
        setPreviewUrl(result.url)

        // Notificar al componente padre
        onImageUploaded(result.url)

        toast({
          title: "Imagen subida",
          description: "La imagen se ha subido correctamente.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo subir la imagen",
          variant: "destructive",
        })
      }
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

  const handleRemoveImage = () => {
    setPreviewUrl("")
    onImageUploaded("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        ref={fileInputRef}
        className="hidden"
        id="image-upload"
      />

      {previewUrl ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border">
          <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-muted/50">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Arrastra una imagen o haz clic para seleccionar</p>
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Seleccionar imagen
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
