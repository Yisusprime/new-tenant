"use client"

import type React from "react"

import { useState } from "react"
import type { RestaurantLocation, CoverageZone } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash, Map } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { useBranch } from "@/lib/context/branch-context"

export default function RestaurantLocationPage({
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
    data: location,
    setData: setLocation,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantLocation>(tenantId, "location", {
    address: "",
    city: "",
    region: "",
    coverageZones: [],
  })

  const [newZone, setNewZone] = useState<Partial<CoverageZone>>({
    name: "",
    deliveryCost: 0,
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
        saveCompleted("location")
      }
    } catch (error) {
      console.error("Error al guardar información de ubicación:", error)
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
      <RestaurantConfigSteps tenantId={tenantId} currentStep="location">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="location">
      <div className="max-w-md space-y-6">
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
                <div className="border rounded-md overflow-hidden">
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
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                  No hay zonas de cobertura configuradas
                </div>
              )}

              <p className="text-sm text-gray-500">
                Configura las zonas donde ofreces servicio de delivery y su costo. Si no ofreces delivery, puedes dejar
                esta sección vacía.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Ubicación y Cobertura
          </Button>
        </form>
      </div>
    </RestaurantConfigSteps>
  )
}
