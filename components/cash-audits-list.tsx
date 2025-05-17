"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCashAudits } from "@/lib/services/cash-audit-service"
import { AlertCircle, AlertTriangle, CheckCircle2, Eye, RefreshCw } from "lucide-react"
import type { CashAudit } from "@/lib/types/cash-register"

interface CashAuditsListProps {
  tenantId: string
  branchId: string
  registerId: string
  onViewAudit: (auditId: string) => void
}

export function CashAuditsList({ tenantId, branchId, registerId, onViewAudit }: CashAuditsListProps) {
  const [audits, setAudits] = useState<CashAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAudits = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getCashAudits(tenantId, branchId, registerId)
      setAudits(data)
    } catch (err) {
      console.error("Error al cargar arqueos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los arqueos de caja")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudits()
  }, [tenantId, branchId, registerId])

  // Obtener el icono y color según el estado del arqueo
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "balanced":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
          color: "bg-green-100 text-green-800",
          text: "Cuadrado",
        }
      case "surplus":
        return {
          icon: <AlertCircle className="h-4 w-4 text-blue-600" />,
          color: "bg-blue-100 text-blue-800",
          text: "Sobrante",
        }
      case "shortage":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          color: "bg-red-100 text-red-800",
          text: "Faltante",
        }
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800",
          text: status,
        }
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Arqueos de Caja</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Arqueos de Caja</h3>
          <Button variant="outline" size="sm" onClick={loadAudits}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Arqueos de Caja</h3>
        <Button variant="outline" size="sm" onClick={loadAudits}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {audits.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sin arqueos</AlertTitle>
          <AlertDescription>No se han realizado arqueos para esta caja.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          {audits.map((audit) => {
            const statusInfo = getStatusInfo(audit.status)
            return (
              <Card key={audit.id} className="hover:border-primary transition-colors">
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Arqueo del {formatDateTime(audit.performedAt)}</CardTitle>
                    <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-3 gap-4 flex-grow">
                      <div>
                        <p className="text-xs text-gray-500">Esperado:</p>
                        <p className="text-sm font-medium">{formatCurrency(audit.expectedCash)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contado:</p>
                        <p className="text-sm font-medium">{formatCurrency(audit.actualCash)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Diferencia:</p>
                        <div className="flex items-center">
                          {statusInfo.icon}
                          <p
                            className={`text-sm font-medium ml-1 ${
                              audit.status === "balanced"
                                ? "text-green-600"
                                : audit.status === "surplus"
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }`}
                          >
                            {formatCurrency(audit.difference)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onViewAudit(audit.id)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
