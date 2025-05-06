"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface GeneralInfoProps {
  tenantData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSwitchChange: (name: string, checked: boolean) => void
}

export function GeneralInfo({ tenantData, handleInputChange, handleSwitchChange }: GeneralInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre del Restaurante</Label>
          <Input id="name" name="name" value={tenantData.name} onChange={handleInputChange} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={tenantData.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="rating">Calificación</Label>
            <Input id="rating" name="rating" value={tenantData.rating} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="distance">Distancia</Label>
            <Input id="distance" name="distance" value={tenantData.distance} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="deliveryTime">Tiempo de entrega</Label>
            <Input id="deliveryTime" name="deliveryTime" value={tenantData.deliveryTime} onChange={handleInputChange} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isOpen"
            checked={tenantData.isOpen}
            onCheckedChange={(checked) => handleSwitchChange("isOpen", checked)}
          />
          <Label htmlFor="isOpen">Restaurante abierto por defecto</Label>
        </div>
      </CardContent>
    </Card>
  )
}
