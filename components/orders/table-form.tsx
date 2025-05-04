"use client"

import type React from "react"

import { useState } from "react"
import { useTableContext } from "./table-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Table } from "@/lib/types/orders"

interface TableFormProps {
  table?: Table
  isOpen: boolean
  onClose: () => void
  tenantId: string
}

export const TableForm: React.FC<TableFormProps> = ({ table, isOpen, onClose, tenantId }) => {
  const { addTable, updateTable } = useTableContext()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [number, setNumber] = useState(table?.number.toString() || "")
  const [capacity, setCapacity] = useState(table?.capacity.toString() || "4")
  const [status, setStatus] = useState(table?.status || "available")
  const [location, setLocation] = useState(table?.location || "main")

  const isEditing = !!table

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!number || !capacity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const tableData: Omit<Table, "id" | "createdAt" | "updatedAt"> = {
        tenantId,
        number: Number.parseInt(number),
        capacity: Number.parseInt(capacity),
        status: status as "available" | "occupied" | "reserved" | "unavailable",
        location,
      }

      if (isEditing && table) {
        await updateTable(table.id, tableData)
        toast({
          title: "Mesa actualizada",
          description: `La mesa ${number} ha sido actualizada correctamente`,
        })
      } else {
        await addTable(tableData)
        toast({
          title: "Mesa creada",
          description: `La mesa ${number} ha sido creada correctamente`,
        })
      }

      onClose()
    } catch (error) {
      console.error("Error saving table:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la mesa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Mesa" : "Añadir Mesa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-number">Número de Mesa</Label>
            <Input
              id="table-number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Número de mesa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-capacity">Capacidad</Label>
            <Input
              id="table-capacity"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Capacidad de personas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="table-status">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
                <SelectItem value="unavailable">No disponible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table-location">Ubicación</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="table-location">
                <SelectValue placeholder="Selecciona una ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Salón principal</SelectItem>
                <SelectItem value="terrace">Terraza</SelectItem>
                <SelectItem value="bar">Barra</SelectItem>
                <SelectItem value="private">Sala privada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
