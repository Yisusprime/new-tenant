"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getRestaurantConfig,
  updateRestaurantConfigSection,
  type RestaurantLocation,
  type CoverageZone,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, Plus, Trash, Map } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RestaurantLocationPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [location, setLocation] = useState<RestaurantLocation>({
    address: "",
    city: "",
    region: "",
    coverageZones: [],
  })
  const [newZone, setNewZone] = useState<Partial<CoverageZone>>({
    name: "",
    deliveryCost: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId)

        if (config && config.location) {
          setLocation(config.location)
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de ubicación",
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

      await updateRestaurantConfigSection(tenantId, "location", location)

      toast({
        title: "Información guardada",
        description: "La información de ubicación se ha actualizado correctamente",
      })

      // Marcar este paso como completado
      const completedSteps = JSON.parse(localStorage.getItem(`${tenantId}_completedConfigSteps`) || "[]")
      if (!completedSteps.includes("location")) {
        completedSteps.push("location")
        localStorage.setItem(`${tenantId}_completedConfigSteps`, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error("Error al guardar información de ubicación:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la información de ubicación",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addCoverageZone = () => {
    if (!newZone.name) {
      toast({
        title: "Error",
        description: "El nombre de la zona es obligatorio",
        variant: "destructive",
      })
      return
    }

    const newZoneWithId: CoverageZone = {
      ...newZone,
      id: crypto.randomUUID().substring(0, 8),
      deliveryCost: Number(newZone.deliveryCost) || 0,
    }

    setLocation({
      ...location,
      coverageZones: [...location.coverageZones, newZoneWithId],
    })

    // Limpiar el formulario
    setNewZone({
      name: "",
      deliveryCost: 0,
    })
  }

  const removeCoverageZone = (id: string) => {
    setLocation({
      ...location,
      coverageZones: location.coverageZones.filter((zone) => zone.id !== id),
    })
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
        <h1 className="text-2xl font-bold">Ubicación y Cobertura</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="location" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Dirección del Restaurante
          </CardTitle>
          <CardDescription>Configura la ubicación física de tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="location-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección Completa *</Label>
                <Textarea
                  id="address"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  placeholder="Calle, número, piso, etc."
                  required
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    placeholder="Ciudad"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Región/Provincia</Label>
                  <Input
                    id="region"
                    value={location.region}
                    onChange={(e) => setLocation({ ...location, region: e.target.value })}
                    placeholder="Región o provincia"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Map className="mr-2 h-5 w-5" />
                Zonas de Cobertura para Delivery
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="zoneName">Nombre de la Zona</Label>
                    <Input
                      id="zoneName"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      placeholder="Ej: Centro, Norte, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryCost">Costo de Delivery</Label>
                    <Input
                      id="deliveryCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newZone.deliveryCost}
                      onChange={(e) => setNewZone({ ...newZone, deliveryCost: Number.parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button type="button" variant="outline" onClick={addCoverageZone} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Zona de Cobertura
                </Button>

                {location.coverageZones.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zona</TableHead>
                        <TableHead>Costo de Delivery</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {location.coverageZones.map((zone) => (
                        <TableRow key={zone.id}>
                          <TableCell>{zone.name}</TableCell>
                          <TableCell>{zone.deliveryCost.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCoverageZone(zone.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                    No hay zonas de cobertura configuradas
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Configura las zonas donde ofreces servicio de delivery y su costo. Si no ofreces delivery, puedes
                  dejar esta sección vacía.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="location-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Ubicación y Cobertura
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
