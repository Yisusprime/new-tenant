"use client"

import type React from "react"

import { useState } from "react"
import type { RestaurantHours, DaySchedule } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { useBranch } from "@/lib/context/branch-context"

export default function RestaurantHoursPage({
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
    data: hours,
    setData: setHours,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantHours>(tenantId, "hours", {
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
        saveCompleted("hours")
      }
    } catch (error) {
      console.error("Error al guardar horarios:", error)
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
      <RestaurantConfigSteps tenantId={tenantId} currentStep="hours">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </RestaurantConfigSteps>
    )
  }

  return (
    <RestaurantConfigSteps tenantId={tenantId} currentStep="hours">
      <div className="max-w-md space-y-6">
        <form id="hours-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Día</TableHead>
                  <TableHead>Abierto</TableHead>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
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
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={day.closeTime}
                        onChange={(e) => updateSchedule(index, "closeTime", e.target.value)}
                        disabled={!day.isOpen}
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Horarios
          </Button>
        </form>
      </div>
    </RestaurantConfigSteps>
  )
}
