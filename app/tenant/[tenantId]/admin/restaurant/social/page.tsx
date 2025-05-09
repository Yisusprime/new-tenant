"use client"

import type React from "react"

import { useState } from "react"
import type { RestaurantSocialMedia } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Globe, Facebook, Instagram, Twitter, TwitterIcon as TikTok } from "lucide-react"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { useBranch } from "@/lib/context/branch-context"

export default function RestaurantSocialMediaPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { currentBranch } = useBranch()

  // Usar nuestro hook personalizado para cargar los datos
  const {
    data: socialMedia,
    setData: setSocialMedia,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantSocialMedia>(tenantId, "socialMedia", {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
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
        saveCompleted("social")
      }
    } catch (error) {
      console.error("Error al guardar redes sociales:", error)
    } finally {
      setSaving(false)
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
        <h1 className="text-2xl font-bold">Redes Sociales</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="social" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Perfiles en Redes Sociales
          </CardTitle>
          <CardDescription>Conecta tus redes sociales para que tus clientes puedan seguirte</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="social-media-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center">
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={socialMedia.facebook}
                  onChange={(e) => setSocialMedia({ ...socialMedia, facebook: e.target.value })}
                  placeholder="https://facebook.com/turestaurante"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={socialMedia.instagram}
                  onChange={(e) => setSocialMedia({ ...socialMedia, instagram: e.target.value })}
                  placeholder="https://instagram.com/turestaurante"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={socialMedia.twitter}
                  onChange={(e) => setSocialMedia({ ...socialMedia, twitter: e.target.value })}
                  placeholder="https://twitter.com/turestaurante"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center">
                  <TikTok className="h-4 w-4 mr-2" />
                  TikTok
                </Label>
                <Input
                  id="tiktok"
                  value={socialMedia.tiktok}
                  onChange={(e) => setSocialMedia({ ...socialMedia, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@turestaurante"
                  type="url"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="social-media-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Redes Sociales
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
