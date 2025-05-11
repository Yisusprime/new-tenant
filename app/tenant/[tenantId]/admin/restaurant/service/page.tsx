"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { getRestaurantConfig, updateRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { useBranch } from "@/lib/context/branch-context"
import { Loader2, Coffee, Truck, ShoppingBag, Table } from "lucide-react"

export default function ServiceMethodsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { toast } = useToast()
  const { currentBranch } = useBranch()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serviceMethods, setServiceMethods] = useState({
    dineIn: false,
    delivery: false,
    takeout: false,
    tables: false,
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

        if (config && config.serviceMethods) {
          setServiceMethods({
            dineIn: config.serviceMethods.dineIn || false,
            delivery: config.serviceMethods.delivery || false,
            takeout: config.serviceMethods.takeout || false,
            tables: config.serviceMethods.tables || false,
          })
        }
      } catch (error) {
        console.error("Error al cargar la configuración:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración de métodos de servicio",
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
        serviceMethods,
      })

      toast({
        title: "Configuración guardada",
        description: "Los métodos de servicio se han actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración de métodos de servicio",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="service">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando configuración...</span>
        </div>
      ) : (
        <div className="space-y-6 max-w-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="dine-in" className="text-base font-medium">
                    En el Local
                  </Label>
                  <p className="text-sm text-muted-foreground">Los clientes pueden comer en tu establecimiento</p>
                </div>
              </div>
              <Switch
                id="dine-in"
                checked={serviceMethods.dineIn}
                onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, dineIn: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
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

            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="takeout" className="text-base font-medium">
                    Para Llevar
                  </Label>
                  <p className="text-sm text-muted-foreground">Los clientes pueden recoger su pedido en el local</p>
                </div>
              </div>
              <Switch
                id="takeout"
                checked={serviceMethods.takeout}
                onCheckedChange={(checked) => setServiceMethods({ ...serviceMethods, takeout: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Table className="h-5 w-5 text-primary" />
                </div>
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

          <Button onClick={handleSave} disabled={saving || !currentBranch} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Métodos de Servicio
          </Button>
        </div>
      )}
    </RestaurantConfigSteps>
  )
}
