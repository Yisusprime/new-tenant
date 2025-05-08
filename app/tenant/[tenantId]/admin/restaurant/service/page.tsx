"use client"

import type React from "react"

import { useState } from "react"
import { updateRestaurantConfigSection, type RestaurantServiceMethods } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Utensils, ShoppingBag, Truck, Table } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"

export default function RestaurantServiceMethodsPage({
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
    data: serviceMethods,
    setData: setServiceMethods,
    loading,
    saveCompleted,
  } = useRestaurantConfig<RestaurantServiceMethods>(tenantId, "serviceMethods", {
    dineIn: false,
    delivery: false,
    takeaway: false,
    tables: false,
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

      await updateRestaurantConfigSection(tenantId, currentBranch.id, "serviceMethods", serviceMethods)

      toast({
        title: "Información guardada",
        description: "Los métodos de servicio se han actualizado correctamente",
      })

      // Marcar este paso como completado
      saveCompleted("service")
    } catch (error) {
      console.error("Error al guardar métodos de servicio:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los métodos de servicio",
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
        <h1 className="text-2xl font-bold">Métodos de Servicio</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="service" />

      {currentBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="mr-2 h-5 w-5" />
              Opciones de Servicio - Sucursal: {currentBranch.name}
            </CardTitle>
            <CardDescription>Configura cómo ofreces tus productos a los clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="service-methods-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Utensils className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <Label htmlFor="dineIn" className="text-base font-medium">
                        En el Local
                      </Label>
                      <p className="text-sm text-muted-foreground">Los clientes pueden comer en tu establecimiento</p>
                    </div>
                  </div>
                  <Switch
                    id="dineIn"
                    checked={serviceMethods.dineIn}
                    onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, dineIn: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <Label htmlFor="delivery" className="text-base font-medium">
                        Delivery
                      </Label>
                      <p className="text-sm text-muted-foreground">Ofreces servicio de entrega a domicilio</p>
                    </div>
                  </div>
                  <Switch
                    id="delivery"
                    checked={serviceMethods.delivery}
                    onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, delivery: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <Label htmlFor="takeaway" className="text-base font-medium">
                        Para Llevar
                      </Label>
                      <p className="text-sm text-muted-foreground">Los clientes pueden recoger su pedido en el local</p>
                    </div>
                  </div>
                  <Switch
                    id="takeaway"
                    checked={serviceMethods.takeaway}
                    onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, takeaway: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Table className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <Label htmlFor="tables" className="text-base font-medium">
                        Mesas
                      </Label>
                      <p className="text-sm text-muted-foreground">Tu local tiene mesas para los clientes</p>
                    </div>
                  </div>
                  <Switch
                    id="tables"
                    checked={serviceMethods.tables}
                    onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, tables: checked })}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" form="service-methods-form" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Guardar Métodos de Servicio
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
