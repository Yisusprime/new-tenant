"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ColorSettingsProps {
  tenantData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function ColorSettings({ tenantData, handleInputChange }: ColorSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="primaryColor">Color Primario (Gradiente Inicio)</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="primaryColor"
              name="primaryColor"
              type="color"
              value={tenantData.primaryColor}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input type="text" value={tenantData.primaryColor} onChange={handleInputChange} name="primaryColor" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="secondaryColor">Color Secundario (Gradiente Fin)</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="secondaryColor"
              name="secondaryColor"
              type="color"
              value={tenantData.secondaryColor}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input type="text" value={tenantData.secondaryColor} onChange={handleInputChange} name="secondaryColor" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="buttonColor">Color de Botones Principales</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="buttonColor"
              name="buttonColor"
              type="color"
              value={tenantData.buttonColor}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input type="text" value={tenantData.buttonColor} onChange={handleInputChange} name="buttonColor" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="productButtonColor">Color de Botones de Productos</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="productButtonColor"
              name="productButtonColor"
              type="color"
              value={tenantData.productButtonColor || "#f97316"}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={tenantData.productButtonColor || "#f97316"}
              onChange={handleInputChange}
              name="productButtonColor"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="buttonTextColor">Color de Texto en Botones</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="buttonTextColor"
              name="buttonTextColor"
              type="color"
              value={tenantData.buttonTextColor || "#ffffff"}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={tenantData.buttonTextColor || "#ffffff"}
              onChange={handleInputChange}
              name="buttonTextColor"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="backgroundColor">Color de Fondo</Label>
          <div className="flex gap-4 items-center">
            <Input
              id="backgroundColor"
              name="backgroundColor"
              type="color"
              value={tenantData.backgroundColor || "#f9fafb"}
              onChange={handleInputChange}
              className="w-16 h-10 p-1"
            />
            <Input
              type="text"
              value={tenantData.backgroundColor || "#f9fafb"}
              onChange={handleInputChange}
              name="backgroundColor"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
