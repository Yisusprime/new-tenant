"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useBranch } from "@/lib/context/branch-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCashRegister } from "@/lib/services/cash-register-service"
import { CashAuditsList } from "@/components/cash-audits-list"
import { CashAuditDetails } from "@/components/cash-audit-details"
import { CashAuditDialog } from "@/components/cash-audit-dialog"
import { AlertCircle, ArrowLeft, Plus } from "lucide-react"
import type { CashRegister } from "@/lib/types/cash-register"

export default function CashRegisterAuditsPage({ params }: { params: { tenantId: string; registerId: string } }) {
  const { tenantId, registerId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [register, setRegister] = useState<CashRegister | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)

  // Cargar datos de la caja
  const loadRegister = async () => {
    if (!currentBranch || !user) return

    try {
      setLoading(true)
      setError(null)

      const registerData = await getCashRegister(tenantId, currentBranch.id, registerId)
      if (!registerData) {
        throw new Error("No se encontró la caja")
      }

      setRegister(registerData)
    } catch (err) {
      console.error("Error al cargar caja:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los datos de la caja")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch && user) {
      loadRegister()
    }
  }, [tenantId, registerId, currentBranch, user])

  // Manejar la visualización de un arqueo
  const handleViewAudit = (auditId: string) => {
    setSelectedAuditId(auditId)
  }

  // Volver a la página de cajas
  const handleBack = () => {
    router.push("/admin/cash-register")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !register || !currentBranch) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Arqueos de Caja</h1>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "No se pudo cargar la información de la caja"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Arqueos de Caja</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          {register.status === "open" && (
            <Button onClick={() => setAuditDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Arqueo
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{register.name}</CardTitle>
          <CardDescription>
            {register.status === "open"
              ? `Caja abierta el ${new Date(register.openedAt).toLocaleString()}`
              : `Caja cerrada el ${new Date(register.closedAt || "").toLocaleString()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CashAuditsList
            tenantId={tenantId}
            branchId={currentBranch.id}
            registerId={registerId}
            onViewAudit={handleViewAudit}
          />
        </CardContent>
      </Card>

      {/* Diálogo para ver detalles de un arqueo */}
      <Dialog open={!!selectedAuditId} onOpenChange={(open) => !open && setSelectedAuditId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Arqueo</DialogTitle>
            <DialogDescription>Información detallada del arqueo de caja realizado.</DialogDescription>
          </DialogHeader>
          {selectedAuditId && (
            <CashAuditDetails tenantId={tenantId} branchId={currentBranch.id} auditId={selectedAuditId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para realizar un nuevo arqueo */}
      <CashAuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        tenantId={tenantId}
        branchId={currentBranch.id}
        userId={user.uid}
        register={register}
        onSuccess={loadRegister}
      />
    </div>
  )
}
