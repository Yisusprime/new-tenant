"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCashAudit } from "@/lib/services/cash-audit-service"
import { getCashRegister } from "@/lib/services/cash-register-service"
import { AlertCircle, AlertTriangle, CheckCircle2, Printer, RefreshCw } from "lucide-react"
import type { CashAudit, CashRegister } from "@/lib/types/cash-register"

interface CashAuditDetailsProps {
  tenantId: string
  branchId: string
  auditId: string
  onPrint?: () => void
}

export function CashAuditDetails({ tenantId, branchId, auditId, onPrint }: CashAuditDetailsProps) {
  const [audit, setAudit] = useState<CashAudit | null>(null)
  const [register, setRegister] = useState<CashRegister | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar el arqueo
      const auditData = await getCashAudit(tenantId, branchId, auditId)
      if (!auditData) {
        throw new Error("No se encontró el arqueo de caja")
      }
      setAudit(auditData)

      // Cargar la caja
      const registerData = await getCashRegister(tenantId, branchId, auditData.registerId)
      setRegister(registerData)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los datos del arqueo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tenantId, branchId, auditId])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !audit) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || "No se pudo cargar el arqueo de caja"}</AlertDescription>
      </Alert>
    )
  }

  // Determinar el estado del arqueo
  let statusIcon = <CheckCircle2 className="h-5 w-5 text-green-600" />
  let statusColor = "bg-green-100 text-green-800"
  let statusText = "Cuadrado"

  if (audit.status === "surplus") {
    statusIcon = <AlertCircle className="h-5 w-5 text-blue-600" />
    statusColor = "bg-blue-100 text-blue-800"
    statusText = "Sobrante"
  } else if (audit.status === "shortage") {
    statusIcon = <AlertTriangle className="h-5 w-5 text-red-600" />
    statusColor = "bg-red-100 text-red-800"
    statusText = "Faltante"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Detalle de Arqueo de Caja</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Arqueo de Caja: {register?.name}</CardTitle>
              <CardDescription>Realizado el {formatDateTime(audit.performedAt)}</CardDescription>
            </div>
            <Badge className={statusColor}>{statusText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Efectivo Esperado:</p>
              <p className="text-lg font-bold">{formatCurrency(audit.expectedCash)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Efectivo Contado:</p>
              <p className="text-lg font-bold">{formatCurrency(audit.actualCash)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Diferencia:</p>
              <div className="flex items-center">
                {statusIcon}
                <p
                  className={`text-lg font-bold ml-1 ${audit.status === "balanced" ? "text-green-600" : audit.status === "surplus" ? "text-blue-600" : "text-red-600"}`}
                >
                  {formatCurrency(audit.difference)}
                </p>
              </div>
            </div>
          </div>

          {audit.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Notas:</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{audit.notes}</p>
            </div>
          )}

          {audit.denominations && (
            <>
              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-md font-medium">Detalle de Denominaciones</h3>

                <div>
                  <h4 className="text-sm font-medium mb-2">Billetes</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(audit.denominations.bills)
                      .filter(([_, count]) => count > 0)
                      .map(([bill, count]) => (
                        <div key={`bill-${bill}`} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">
                            ${bill} x {count}
                          </span>
                          <span className="text-sm font-medium">{formatCurrency(Number.parseFloat(bill) * count)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Monedas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(audit.denominations.coins)
                      .filter(([_, count]) => count > 0)
                      .map(([coin, count]) => (
                        <div key={`coin-${coin}`} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">
                            ${coin} x {count}
                          </span>
                          <span className="text-sm font-medium">{formatCurrency(Number.parseFloat(coin) * count)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
