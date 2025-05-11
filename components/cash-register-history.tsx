"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getCashRegisterHistory } from "@/lib/services/cash-register-service"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import type { CashRegister } from "@/lib/types/cash-register"
import { Clock } from "lucide-react"

export function CashRegisterHistory({ tenantId, branchId }: { tenantId: string; branchId: string }) {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadCashRegisters() {
      try {
        setLoading(true)
        setError(null)
        const registers = await getCashRegisterHistory(tenantId, branchId)
        setCashRegisters(registers)
      } catch (err) {
        console.error("Error al cargar el historial de cajas:", err)
        setError(err instanceof Error ? err : new Error("Error desconocido al cargar el historial"))
      } finally {
        setLoading(false)
      }
    }

    loadCashRegisters()
  }, [tenantId, branchId])

  const handleViewDetails = (cashRegisterId: string) => {
    router.push(`/tenant/${tenantId}/admin/cash-register/${cashRegisterId}`)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cajas</CardTitle>
          <CardDescription>Cargando historial...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Ocurrió un error al cargar el historial de cajas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error.message}</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Cajas</CardTitle>
        <CardDescription>Registro de aperturas y cierres de caja</CardDescription>
      </CardHeader>
      <CardContent>
        {cashRegisters.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Diferencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashRegisters.map((register) => (
                <TableRow key={register.id}>
                  <TableCell>
                    <div className="font-medium">{formatDateTime(register.openedAt, "short")}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {register.status === "open"
                        ? "En curso"
                        : register.closedAt
                          ? formatDateTime(register.closedAt, "time")
                          : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={register.status === "open" ? "outline" : "secondary"}>
                      {register.status === "open" ? "Abierta" : "Cerrada"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(register.summary?.totalSales || 0)}
                    <div className="text-xs text-gray-500">{register.summary?.totalOrders || 0} pedidos</div>
                  </TableCell>
                  <TableCell>
                    {register.status === "closed" && register.difference !== undefined ? (
                      <span
                        className={
                          register.difference < 0 ? "text-red-600" : register.difference > 0 ? "text-green-600" : ""
                        }
                      >
                        {register.difference === 0 ? "Sin diferencia" : formatCurrency(register.difference)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(register.id)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-gray-500">No hay registros de cajas anteriores</div>
        )}
      </CardContent>
    </Card>
  )
}
