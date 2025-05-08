"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  getRestaurantConfig,
  updateRestaurantConfigSection,
  uploadRestaurantLogo,
  deleteRestaurantLogo,
  type RestaurantBasicInfo,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, Trash, Store } from "lucide-react"
import Image from "next/image"

export default function RestaurantBasicInfoPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [basicInfo, setBasicInfo] = useState<RestaurantBasicInfo>({
    name: "",
    shortDescription: "",
    localId: "",
    taxIncluded: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId)

        if (config && config.basicInfo) {
          setBasicInfo(config.basicInfo)
        } else {
          // Establecer el ID del local igual al tenantId por defecto
          setBasicInfo((prev) => ({ ...prev, localId: tenantId }))
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información del restaurante",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [tenantId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      await updateRestaurantConfigSection(tenantId, "basicInfo", basicInfo)

      toast({
        title: "Información guardada",
        description: "La información básica del restaurante se ha actualizado correctamente",
      })

      // Marcar este paso como completado (puedes implementar esta función)
      const completedSteps = JSON.parse(localStorage.getItem(`${tenantId}_completedConfigSteps`) || "[]")
      if (!completedSteps.includes("basic")) {
        completedSteps.push("basic")
        localStorage.setItem(`${tenantId}_completedConfigSteps`, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error("Error al guardar información básica:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información básica",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return

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

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "La imagen no debe superar los 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingLogo(true)

      const logoUrl = await uploadRestaurantLogo(tenantId, file)

      // Actualizar el estado local
      setBasicInfo((prev) => ({ ...prev, logo: logoUrl }))

      toast({
        title: "Logo actualizado",
        description: "El logo del restaurante se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al subir logo:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteLogo = async () => {
    if (!basicInfo.logo) return

    try {
      setUploadingLogo(true)

      await deleteRestaurantLogo(tenantId)

      // Actualizar el estado local
      setBasicInfo((prev) => ({ ...prev, logo: undefined }))

      toast({
        title: "Logo eliminado",
        description: "El logo del restaurante se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar logo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
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
        <h1 className="text-2xl font-bold">Información Básica del Restaurante</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="basic" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Datos Básicos
          </CardTitle>
          <CardDescription>Configura la información esencial de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="basic-info-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Logo del restaurante */}
            <div className="flex flex-col items-center mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Logo del Restaurante</h3>
              <div className="relative mb-4">
                {basicInfo.logo ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={basicInfo.logo || "/placeholder.svg"}
                      alt="Logo del restaurante"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Store className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {uploadingLogo ? (
                  <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
              </div>

              {basicInfo.logo && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={handleDeleteLogo}
                  disabled={uploadingLogo}
                  type="button"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar logo
                </Button>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Recomendado: Imagen cuadrada de al menos 200x200 píxeles. Máximo 2MB.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Restaurante *</Label>
                <Input
                  id="name"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                  placeholder="Nombre de tu restaurante"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descripción Corta</Label>
                <Textarea
                  id="shortDescription"
                  value={basicInfo.shortDescription}
                  onChange={(e) => setBasicInfo({ ...basicInfo, shortDescription: e.target.value })}
                  placeholder="Breve descripción de tu restaurante (máx. 150 caracteres)"
                  maxLength={150}
                  rows={3}
                />
                <p className="text-xs text-gray-500">{basicInfo.shortDescription.length}/150 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localId">ID del Local *</Label>
                <Input
                  id="localId"
                  value={basicInfo.localId}
                  onChange={(e) => setBasicInfo({ ...basicInfo, localId: e.target.value })}
                  placeholder="Identificador único para tu local"
                  required
                />
                <p className="text-xs text-gray-500">
                  Este identificador se usará internamente para referenciar tu restaurante.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="taxIncluded">IVA Incluido</Label>
                  <p className="text-sm text-muted-foreground">Los precios mostrados incluyen IVA</p>
                </div>
                <Switch
                  id="taxIncluded"
                  checked={basicInfo.taxIncluded}
                  onCheckedChange={(checked) => setBasicInfo({ ...basicInfo, taxIncluded: checked })}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="basic-info-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Información Básica
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
