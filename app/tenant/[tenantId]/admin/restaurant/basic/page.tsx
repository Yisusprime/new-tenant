"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  uploadRestaurantLogo,
  deleteRestaurantLogo,
  type RestaurantBasicInfo,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    taxIncluded: true,
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
    if (!basicInfo.logo || !currentBranch) return

    try {
      setUploadingLogo(true)

      await deleteRestaurantLogo(tenantId, currentBranch.id)

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
    <div>
      <RestaurantConfigSteps tenantId={tenantId} currentStep="basic" />

      {/* El contenido específico de este paso se renderiza dentro del componente RestaurantConfigSteps */}
      {/* No necesitamos mostrar nada aquí, ya que el componente RestaurantConfigSteps maneja la estructura */}
    </div>
  )
}
