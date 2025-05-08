"use client"

import type React from "react"

import { useState } from "react"
import { updateRestaurantConfigSection, type RestaurantContactInfo } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Phone, Mail, MessageSquare } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"

export default function RestaurantContactPage({
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
    data: contactInfo,
    setData: setContactInfo,
    loading,
    saveCompleted,
  } = useRestaurantConfig<RestaurantContactInfo>(tenantId, "contactInfo", {
    phone: "",
    email: "",
    whatsapp: "",
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

      await updateRestaurantConfigSection(tenantId, currentBranch.id, "contactInfo", contactInfo)

      toast({
        title: "Información guardada",
        description: "La información de contacto se ha actualizado correctamente",
      })

      // Marcar este paso como completado
      saveCompleted("contact")
    } catch (error) {
      console.error("Error al guardar información de contacto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información de contacto",
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
        <h1 className="text-2xl font-bold">Información de Contacto</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="contact" />

      {currentBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="mr-2 h-5 w-5" />
              Datos de Contacto - Sucursal: {currentBranch.name}
            </CardTitle>
            <CardDescription>Configura los medios de contacto para tus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Teléfono de Contacto
                  </Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="Ej: +34 123 456 789"
                  />
                  <p className="text-xs text-gray-500">
                    Número principal para que los clientes se comuniquen con tu restaurante.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    placeholder="Ej: info@turestaurante.com"
                  />
                  <p className="text-xs text-gray-500">Email para consultas, reservas o información general.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={contactInfo.whatsapp}
                    onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                    placeholder="Ej: +34 123 456 789"
                  />
                  <p className="text-xs text-gray-500">
                    Número de WhatsApp para atención al cliente (puede ser el mismo que el teléfono).
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" form="contact-form" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Guardar Información de Contacto
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
