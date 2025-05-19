"use client"

import type React from "react"

import { useState } from "react"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CurrencyConfig {
  currencyCode: string
  taxEnabled: boolean
  taxIncluded: boolean
  taxRate: number
}

export default function RestaurantCurrencyPage({
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
    data: currencyConfig,
    setData: setCurrencyConfig,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<CurrencyConfig>(tenantId, "currencyConfig", {
    currencyCode: "CLP", // Peso chileno por defecto
    taxEnabled: false, // IVA desactivado por defecto
    taxIncluded: true, // IVA incluido en los precios por defecto
    taxRate: 0.19, // 19% por defecto (Chile)
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

      // Usar el método saveData
      const success = await saveData()

      if (success) {
        // Marcar este paso como completado
        saveCompleted("currency")
      }
    } catch (error) {
      console.error("Error al guardar configuración de moneda:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleTaxRateChange = (value: string) => {
    const rate = Number.parseFloat(value) / 100
    setCurrencyConfig((prev) => ({ ...prev, taxRate: rate }))
  }

  // Manejar el cambio de estado del IVA
  const handleTaxEnabledChange = (enabled: boolean) => {
    setCurrencyConfig((prev) => ({ ...prev, taxEnabled: enabled }))
  }

  if (loading) {
    return (
      <RestaurantConfigSteps tenantId={tenantId} currentStep="currency">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="currency">
      <div className="max-w-md space-y-6">
        <form id="currency-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Moneda</CardTitle>
              <CardDescription>Define la moneda que utilizará tu restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Moneda *</Label>
                <Select
                  value={currencyConfig.currencyCode}
                  onValueChange={(value) => setCurrencyConfig({ ...currencyConfig, currencyCode: value })}
                >
                  <SelectTrigger id="currencyCode">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                    <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                    <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                    <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
                    <SelectItem value="PEN">Sol Peruano (PEN)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Esta moneda se usará para mostrar los precios en tu restaurante.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Impuestos</CardTitle>
              <CardDescription>Define cómo se manejarán los impuestos en tu restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="taxEnabled">IVA Activado</Label>
                  <p className="text-sm text-muted-foreground">Activar/desactivar el cálculo de IVA</p>
                </div>
                <Switch id="taxEnabled" checked={currencyConfig.taxEnabled} onCheckedChange={handleTaxEnabledChange} />
              </div>

              {currencyConfig.taxEnabled && (
                <>
                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="taxIncluded">IVA Incluido</Label>
                      <p className="text-sm text-muted-foreground">Los precios mostrados incluyen IVA</p>
                    </div>
                    <Switch
                      id="taxIncluded"
                      checked={currencyConfig.taxIncluded}
                      onCheckedChange={(checked) => setCurrencyConfig({ ...currencyConfig, taxIncluded: checked })}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                    <Select value={(currencyConfig.taxRate * 100).toString()} onValueChange={handleTaxRateChange}>
                      <SelectTrigger id="taxRate">
                        <SelectValue placeholder="Selecciona la tasa de IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="19">19% (Chile)</SelectItem>
                        <SelectItem value="21">21% (Argentina)</SelectItem>
                        <SelectItem value="16">16% (México)</SelectItem>
                        <SelectItem value="18">18% (Perú)</SelectItem>
                        <SelectItem value="12">12% (Ecuador)</SelectItem>
                        <SelectItem value="13">13% (Costa Rica)</SelectItem>
                        <SelectItem value="0">0% (Sin IVA)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Esta tasa se aplicará a los precios {currencyConfig.taxIncluded ? "incluidos" : "sin incluir"}{" "}
                      IVA.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Configuración
          </Button>
        </form>
      </div>
    </RestaurantConfigSteps>
  )
}
