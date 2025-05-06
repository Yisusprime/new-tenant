"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface DisplaySettingsProps {
  tenantData: any
  handleOpacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function DisplaySettings({ tenantData, handleOpacityChange }: DisplaySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opciones de Visualización</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="bannerOpacity">Opacidad del Banner</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm">Transparente</span>
              <Input
                id="bannerOpacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tenantData.bannerOpacity}
                onChange={handleOpacityChange}
                className="flex-1"
              />
              <span className="text-sm">Opaco</span>
            </div>
            <div className="text-sm text-center">
              {tenantData.bannerOpacity === 0
                ? "Banner completamente transparente (sin difuminado)"
                : `Opacidad: ${Math.round(tenantData.bannerOpacity * 100)}%`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
