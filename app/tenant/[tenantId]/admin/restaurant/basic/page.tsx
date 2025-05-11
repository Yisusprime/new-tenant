"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { getRestaurantConfig, updateRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { useBranch } from "@/lib/context/branch-context"
import { Loader2, Upload } from "lucide-react"
import Image from "next/image"

export default function BasicInfoPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { toast } = useToast()
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    description: "",
    logo: "",
    slogan: "",
  })

  useEffect(() => {
    async function loadConfig() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId, currentBranch.id)

        if (config && config.basicInfo) {
          setBasicInfo({
            name: config.basicInfo.name || "",
            description: config.basicInfo.description || "",
            logo: config.basicInfo.logo || "",
            slogan: config.basicInfo.slogan || "",
          })
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información básica",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [tenantId, currentBranch, toast])

  const handleSave = async () => {
    if (!currentBranch) return

    try {
      setSaving(true)
      await updateRestaurantConfig(tenantId, currentBranch.id, {
        basicInfo,
      })

      toast({
        title: "Configuración guardada",
        description: "La información básica se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
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
    if (!e.target.files || e.target.files.length === 0 || !currentBranch) return

    const file = e.target.files[0]
    const formData = new FormData()
    formData.append("file", file)

    try {
      setUploading(true)

      // Aquí iría la lógica para subir la imagen
      // Por ahora, simulamos una carga exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulamos una URL de imagen
      const logoUrl = `/restaurant-logo.png`

      setBasicInfo({
        ...basicInfo,
        logo: logoUrl,
      })

      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente",
      })
    } catch (error) {
      console.error("Error al subir el logo:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el logo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="basic">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando información...</span>
        </div>
      ) : (
        <div className="space-y-6 max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Restaurante *</Label>
              <Input
                id="name"
                value={basicInfo.name}
                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                placeholder="Ej. Delicious Restaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">Eslogan (Opcional)</Label>
              <Input
                id="slogan"
                value={basicInfo.slogan}
                onChange={(e) => setBasicInfo({ ...basicInfo, slogan: e.target.value })}
                placeholder="Ej. La mejor comida de la ciudad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                placeholder="Describe tu restaurante en pocas palabras..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo del Restaurante</Label>
              <div className="flex items-center space-x-4">
                {basicInfo.logo ? (
                  <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                    <Image
                      src={basicInfo.logo || "/placeholder.svg"}
                      alt="Logo del restaurante"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">Sin logo</span>
                  </div>
                )}

                <div className="flex-1">
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {basicInfo.logo ? "Cambiar logo" : "Subir logo"}
                      </>
                    )}
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recomendado: 512x512px, formato PNG o JPG</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !currentBranch || !basicInfo.name || !basicInfo.description}
            className="w-full"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Información Básica
          </Button>
        </div>
      )}
    </RestaurantConfigSteps>
  )
}
