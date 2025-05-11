"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { getCashRegisterHistory } from "@/lib/services/cash-register-service"
import type { CashRegister } from "@/lib/types/cash-register"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Eye } from "lucide-react"

export function CashRegisterHistory({
  tenantId,
  branchId,
}: {
  tenantId: string
  branchId: string
}) {
  const [history, setHistory] = useState<CashRegister[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        const historyData = await getCashRegisterHistory(tenantId, branchId)
        setHistory(historyData || [])
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [tenantId, branchId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No hay historial de cajas</h3>
        <p className="text-muted-foreground">Aún no se ha registrado ninguna caja</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Cajas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Fecha</th>
                <th className="text-left py-2 px-4">Abierta por</th>
                <th className="text-right py-2 px-4">Monto Inicial</th>
                <th className="text-right py-2 px-4">Monto Final</th>
                <th className="text-right py-2 px-4">Diferencia</th>
                <th className="text-center py-2 px-4">Estado</th>
                <th className="text-center py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.map((register) => (
                <tr key={register.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    {register.openedAt ? new Date(register.openedAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="py-2 px-4">{register.openedBy || "N/A"}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(register.initialAmount || 0)}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(register.finalAmount || 0)}</td>
                  <td className="py-2 px-4 text-right">
                    {register.finalAmount !== undefined && register.expectedAmount !== undefined ? (
                      <span
                        className={register.finalAmount < register.expectedAmount ? "text-red-600" : "text-green-600"}
                      >
                        {formatCurrency(register.finalAmount - register.expectedAmount)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        register.status === "open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {register.status === "open" ? "Abierta" : "Cerrada"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/cash-register/${register.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
