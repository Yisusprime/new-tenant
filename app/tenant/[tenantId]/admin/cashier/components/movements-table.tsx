"use client"

import type { CashMovement, CashCategory } from "@/lib/types/cashier"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getCashCategories } from "@/lib/services/cashier-service"

interface MovementsTableProps {
  movements: CashMovement[]
  tenantId: string
}

export function MovementsTable({ movements, tenantId }: MovementsTableProps) {
  const [categories, setCategories] = useState<Record<string, CashCategory>>({})

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCashCategories(tenantId)
        const catsMap: Record<string, CashCategory> = {}
        cats.forEach((cat) => {
          catsMap[cat.id] = cat
        })
        setCategories(catsMap)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }

    loadCategories()
  }, [tenantId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return { label: "Ingreso", variant: "success" as const }
      case "expense":
        return { label: "Egreso", variant: "destructive" as const }
      case "initial":
        return { label: "Apertura", variant: "default" as const }
      case "closing":
        return { label: "Cierre", variant: "secondary" as const }
      default:
        return { label: type, variant: "outline" as const }
    }
  }

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return "N/A"

    switch (method) {
      case "cash":
        return "Efectivo"
      case "card":
        return "Tarjeta"
      case "transfer":
        return "Transferencia"
      case "other":
        return "Otro"
      default:
        return method
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No hay movimientos registrados
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => {
              const { label, variant } = getMovementTypeLabel(movement.type)
              return (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{formatDate(movement.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={variant}>{label}</Badge>
                  </TableCell>
                  <TableCell>{movement.description}</TableCell>
                  <TableCell>
                    {movement.category && categories[movement.category] ? categories[movement.category].name : "N/A"}
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(movement.paymentMethod)}</TableCell>
                  <TableCell className={`text-right ${movement.type === "expense" ? "text-red-500" : ""}`}>
                    {formatCurrency(movement.amount)}
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
