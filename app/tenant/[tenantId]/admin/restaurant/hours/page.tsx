"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getRestaurantConfig,
  updateRestaurantConfigSection,
  type RestaurantHours,
  type DaySchedule,
} from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RestaurantHoursPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState<RestaurantHours>({
    schedule: [
      { day: "Lunes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Martes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Miércoles", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Jueves", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Viernes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "Sábado", isOpen: true, openTime: "10:00", closeTime: "15:00" },
      { day: "Domingo", isOpen: false, openTime: "00:00", closeTime: "00:00" },
    ],
  })
  const { toast } = useToast()

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        const config = await getRestaurantConfig(tenantId)

        if (config && config.hours) {
          setHours(config.hours)
        }
      } catch (error) {
        console.error("Error al cargar configuración:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios",
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

      await updateRestaurantConfigSection(tenantId, "hours", hours)

      toast({
        title: "Información guardada",
        description: "Los horarios se han actualizado correctamente",
      })

      // Marcar este paso como completado
      const completedSteps = JSON.parse(localStorage.getItem(`${tenantId}_completedConfigSteps`) || "[]")
      if (!completedSteps.includes("hours")) {
        completedSteps.push("hours")
        localStorage.setItem(`${tenantId}_completedConfigSteps`, JSON.stringify(completedSteps))
      }
    } catch (error) {
      console.error("Error al guardar horarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los horarios",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSchedule = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...hours.schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setHours({ ...hours, schedule: newSchedule })
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
        <h1 className="text-2xl font-bold">Horarios de Atención</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="hours" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Horarios de Funcionamiento
          </CardTitle>
          <CardDescription>Configura los días y horas en que tu restaurante está abierto</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="hours-form" onSubmit={handleSubmit} className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead>Abierto</TableHead>
                  <TableHead>Hora de Apertura</TableHead>
                  <TableHead>Hora de Cierre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hours.schedule.map((day, index) => (
                  <TableRow key={day.day}>
                    <TableCell className="font-medium">{day.day}</TableCell>
                    <TableCell>
                      <Switch
                        checked={day.isOpen}
                        onCheckedChange={(checked) => updateSchedule(index, "isOpen", checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={day.openTime}
                        onChange={(e) => updateSchedule(index, "openTime", e.target.value)}
                        disabled={!day.isOpen}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateSchedule(index, "closeTime", e.target.value)}
                        disabled={!day.isOpen}
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="hours-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Horarios
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
