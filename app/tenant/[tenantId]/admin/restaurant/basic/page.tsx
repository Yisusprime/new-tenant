"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  uploadRestaurantLogo,
  deleteRestaurantLogo,
  uploadRestaurantBanner,
  deleteRestaurantBanner,
  type RestaurantBasicInfo,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Camera, Trash, Store, ImageIcon } from "lucide-react"
import Image from "next/image"
import { useBranch } from "@/lib/context/branch-context"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"

export default function RestaurantBasicInfoPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const logoFileInputRef = useRef<HTMLInputElement>(null)
  const bannerFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { currentBranch } = useBranch()

  // Usar nuestro hook personalizado para cargar los datos
  const {
    data: basicInfo,
    setData: setBasicInfo,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantBasicInfo>(tenantId, "basicInfo", {
    name: currentBranch?.name || "",
    shortDescription: "",
    localId: tenantId,
    taxEnabled: false,
    taxIncluded: true,
    currencyCode: "CLP",
    taxRate: 0.19,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Usar el nuevo método saveData
      const success = await saveData()

      if (success) {
        // Marcar este paso como completado
        saveCompleted("basic")
      }
    } catch (error) {
      console.error("Error al guardar información básica:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentBranch) return

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
      setUploadingLogo(true)

      const logoUrl = await uploadRestaurantLogo(tenantId, currentBranch.id, file)

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
        description: error instanceof Error ? error.message : "No se pudo subir el logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
      // Limpiar el input de archivo
      if (logoFileInputRef.current) logoFileInputRef.current.value = ""
    }
  }

  const handleDeleteLogo = async () => {
    if (!basicInfo.logo || !currentBranch) return

    try {
      setUploadingLogo(true)

      await deleteRestaurantLogo(tenantId, currentBranch.id, basicInfo.logo)

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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentBranch) return

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
      setUploadingBanner(true)

      const bannerUrl = await uploadRestaurantBanner(tenantId, currentBranch.id, file)

      // Actualizar el estado local
      setBasicInfo((prev) => ({ ...prev, bannerImage: bannerUrl }))

      toast({
        title: "Banner actualizado",
        description: "El banner del restaurante se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al subir banner:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo subir el banner",
        variant: "destructive",
      })
    } finally {
      setUploadingBanner(false)
      // Limpiar el input de archivo
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = ""
    }
  }

  const handleDeleteBanner = async () => {
    if (!basicInfo.bannerImage || !currentBranch) return

    try {
      setUploadingBanner(true)

      await deleteRestaurantBanner(tenantId, currentBranch.id, basicInfo.bannerImage)

      // Actualizar el estado local
      setBasicInfo((prev) => ({ ...prev, bannerImage: undefined }))

      toast({
        title: "Banner eliminado",
        description: "El banner del restaurante se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar banner:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el banner",
        variant: "destructive",
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  if (loading) {
    return (
      <RestaurantConfigSteps tenantId={tenantId} currentStep="basic">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="basic">
      <div className="max-w-2xl space-y-6">
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
                  onClick={() => logoFileInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}

              <input
                type="file"
                ref={logoFileInputRef}
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
              Recomendado: Imagen cuadrada de al menos 200x200 píxeles. Máximo 5MB.
            </p>
          </div>

          {/* Banner del restaurante */}
          <div className="flex flex-col items-center mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Banner del Restaurante</h3>
            <div className="relative mb-4">
              {basicInfo.bannerImage ? (
                <div className="relative w-80 h-40 rounded-lg overflow-hidden border">
                  <Image
                    src={basicInfo.bannerImage || "/placeholder.svg"}
                    alt="Banner del restaurante"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-80 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {uploadingBanner ? (
                <div className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-2 right-2 rounded-full"
                  onClick={() => bannerFileInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}

              <input
                type="file"
                ref={bannerFileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
              />
            </div>

            {basicInfo.bannerImage && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={handleDeleteBanner}
                disabled={uploadingBanner}
                type="button"
              >
                <Trash className="h-4 w-4 mr-2" />
                Eliminar banner
              </Button>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: Imagen rectangular de al menos 800x400 píxeles (proporción 2:1). Máximo 5MB.
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
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Información Básica
          </Button>
        </form>
      </div>
    </RestaurantConfigSteps>
  )
}
