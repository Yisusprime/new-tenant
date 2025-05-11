"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Table } from "@/lib/services/table-service"
import { getTables } from "@/lib/services/table-service"
import { Utensils, Users, Plus } from "lucide-react"

interface TablesListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onCreateOrder: (table: Table) => void
}

export function TablesListDialog({ open, onOpenChange, tenantId, branchId, onCreateOrder }: TablesListDialogProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTables() {
      if (!branchId) return

      try {
        setLoading(true)
        const tablesData = await getTables(tenantId, branchId)
        setTables(tablesData || [])
      } catch (error) {
        console.error("Error al cargar mesas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTables()
  }, [tenantId, branchId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Mesa</DialogTitle>
          <DialogDescription>Selecciona una mesa para crear un nuevo pedido.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loading ? (
            <div>Cargando mesas...</div>
          ) : tables.length > 0 ? (
            tables
              .filter((table) => table.isActive)
              .map((table) => (
                <Card key={table.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardHeader>
                    <CardTitle>Mesa {table.number}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center p-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <Utensils className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Mesa {table.number}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {table.capacity} personas
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => onCreateOrder(table)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Pedido
                    </Button>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <div>No hay mesas disponibles</div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
