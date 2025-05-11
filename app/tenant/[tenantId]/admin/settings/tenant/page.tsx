"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function TenantSettingsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tenantData, setTenantData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    logo: "",
    customDomain: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadTenantData() {
      try {
        setLoading(true)
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))

        if (tenantDoc.exists()) {
          const data = tenantDoc.data()
          setTenantData({
            name: data.name || "",
            description: data.description || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            address: data.address || "",
            logo: data.logo || "",
            customDomain: data.customDomain || "",
          })
        }
      } catch (error) {
        console.error("Error al cargar datos del tenant:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del restaurante",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTenantData()
  }, [tenantId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      await updateDoc(doc(db, "tenants", tenantId), {
        name: tenantData.name,
        description: tenantData.description,
        contactEmail: tenantData.contactEmail,
        contactPhone: tenantData.contactPhone,
        address: tenantData.address,
        customDomain: tenantData.customDomain,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Configuración actualizada",
        description: "Los datos del restaurante se han actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar tenant:", error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos del restaurante",
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
        <h1 className="text-2xl font-bold">Configuración del Restaurante</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Configura la información básica de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="tenant-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Restaurante</Label>
              <Input
                id="name"
                value={tenantData.name}
                onChange={(e) => setTenantData({ ...tenantData, name: e.target.value })}
                placeholder="Nombre de tu restaurante"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={tenantData.description}
                onChange={(e) => setTenantData({ ...tenantData, description: e.target.value })}
                placeholder="Describe tu restaurante"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={tenantData.contactEmail}
                  onChange={(e) => setTenantData({ ...tenantData, contactEmail: e.target.value })}
                  placeholder="Email de contacto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                <Input
                  id="contactPhone"
                  value={tenantData.contactPhone}
                  onChange={(e) => setTenantData({ ...tenantData, contactPhone: e.target.value })}
                  placeholder="Teléfono de contacto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={tenantData.address}
                onChange={(e) => setTenantData({ ...tenantData, address: e.target.value })}
                placeholder="Dirección del restaurante"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDomain">Dominio Personalizado</Label>
              <Input
                id="customDomain"
                value={tenantData.customDomain}
                onChange={(e) => setTenantData({ ...tenantData, customDomain: e.target.value })}
                placeholder="turestaurante.com"
              />
              <p className="text-sm text-muted-foreground">
                Disponible solo en planes Premium y Enterprise. Actualmente estás usando {tenantId}.gastroo.online
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="tenant-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
