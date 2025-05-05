"use client"

import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ContactSettingsProps {
  tenantData: any
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleScheduleChange: (index: number, field: "day" | "hours", value: string) => void
  handleFeatureChange: (index: number, value: string) => void
  addSchedule: () => void
  removeSchedule: (index: number) => void
  addFeature: () => void
  removeFeature: (index: number) => void
}

export function ContactSettings({
  tenantData,
  handleInputChange,
  handleScheduleChange,
  handleFeatureChange,
  addSchedule,
  removeSchedule,
  addFeature,
  removeFeature,
}: ContactSettingsProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" value={tenantData.address} onChange={handleInputChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" value={tenantData.phone} onChange={handleInputChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" value={tenantData.email} onChange={handleInputChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input id="website" name="website" value={tenantData.website} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenantData.openingHours.map((schedule: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={schedule.day}
                  onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                  className="flex-1"
                />
                <Input
                  value={schedule.hours}
                  onChange={(e) => handleScheduleChange(index, "hours", e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => removeSchedule(index)}>
                  Eliminar
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addSchedule} className="w-full">
              Añadir Horario
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenantData.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => removeFeature(index)}>
                  Eliminar
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addFeature} className="w-full">
              Añadir Característica
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes Sociales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              name="socialMedia.facebook"
              value={tenantData.socialMedia.facebook}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="socialMedia.instagram"
              value={tenantData.socialMedia.instagram}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="socialMedia.twitter"
              value={tenantData.socialMedia.twitter}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
