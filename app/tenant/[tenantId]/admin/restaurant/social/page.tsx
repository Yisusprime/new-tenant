"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getRestaurantConfig,
  updateRestaurantConfigSection,
  type RestaurantSocialMedia,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Globe, Facebook, Instagram, Twitter, TwitterIcon as TikTok } from "lucide-react"

export default function RestaurantSocialMediaPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [socialMedia, setSocialMedia] = useState<RestaurantSocialMedia>({
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId)

        if (config && config.socialMedia) {
          setSocialMedia(config.socialMedia)
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las redes sociales",
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

      await updateRestaurantConfigSection(tenantId, "socialMedia", socialMedia)

      toast({
        title: "Información guardada",
        description: "Las redes sociales se han actualizado correctamente",
      })

      // Marcar este paso como completado
      const completedSteps = JSON.parse(localStorage.getItem(`${tenantId}_completedConfigSteps`) || "[]")
      if (!completedSteps.includes("social")) {
        completedSteps.push("social")
        localStorage.setItem(`${tenantId}_completedConfigSteps`, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error("Error al guardar redes sociales:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las redes sociales",
        variant: "destructive",
      })
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
