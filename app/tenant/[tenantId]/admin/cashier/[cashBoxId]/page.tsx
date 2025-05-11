"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { useBranch } from "@/lib/context/branch-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { MovementsTable } from "../components/movements-table"
import { CashBoxSummary } from "../components/cash-box-summary"
import { AddMovementDialog } from "../components/add-movement-dialog"
import { OpenCashBoxDialog } from "../components/open-cash-box-dialog"
import { CloseCashBoxDialog } from "../components/close-cash-box-dialog"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { ArrowLeft, Lock, PlusCircle, Printer, Unlock } from "lucide-react"

export default function CashBoxDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cashBoxId = params.cashBoxId as string
  const { tenantId, currentBranch, hasActiveBranches } = useBranch()
  const { cashBox, movements, summary, loading, error, loadCashBox } = useCashBox(cashBoxId)

  const [isAddMovementDialogOpen, setIsAddMovementDialogOpen] = useState(false)
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)

  const handleBack = () => {
    router.push("/admin/cashier")
  }

  const handleDialogSuccess = () => {
    loadCashBox()
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  if (!currentBranch || !hasActiveBranches) {
    return <NoBranchSelectedAlert />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !cashBox) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">{error || "No se encontró la caja especificada"}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{cashBox.name}</h1>
          <Badge variant={cashBox.isOpen ? "success" : "secondary"}>{cashBox.isOpen ? "Abierta" : "Cerrada"}</Badge>
        </div>
        <div className="flex gap-2">
          {cashBox.isOpen ? (
            <>
              <Button variant="outline" onClick={() => setIsAddMovementDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nuevo Movimiento
              </Button>
              <Button variant="destructive" onClick={() => setIsCloseDialogOpen(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Cerrar Caja
              </Button>
            </>
          ) : (
            <Button variant="default" onClick={() => setIsOpenDialogOpen(true)}>
              <Unlock className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Caja</CardTitle>
          <CardDescription>
            {cashBox.isOpen
              ? `Abierta el ${formatDate(cashBox.openedAt)}`
              : cashBox.closedAt
                ? `Cerrada el ${formatDate(cashBox.closedAt)}`
                : "No ha sido abierta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Monto Inicial</h3>
              <p className="text-lg font-semibold">{formatCurrency(cashBox.initialAmount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {cashBox.isOpen ? "Monto Actual (Esperado)" : "Monto Final"}
              </h3>
              <p className="text-lg font-semibold">
                {cashBox.isOpen ? formatCurrency(cashBox.expectedAmount) : formatCurrency(cashBox.currentAmount)}
              </p>
            </div>
            {!cashBox.isOpen && cashBox.closedAt && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Diferencia</h3>
                  <p
                    className={`text-lg font-semibold ${cashBox.difference && cashBox.difference < 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {cashBox.difference !== undefined ? formatCurrency(cashBox.difference) : "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cerrado por</h3>
                  <p className="text-lg font-semibold">{cashBox.closedBy || "N/A"}</p>
                </div>
              </>
            )}
          </div>
          {cashBox.notes && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <h3 className="text-sm font-medium">Notas:</h3>
              <p className="text-sm whitespace-pre-line">{cashBox.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Resumen</h2>
          <CashBoxSummary summary={summary} />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Movimientos</h2>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
        {tenantId && <MovementsTable movements={movements} tenantId={tenantId} />}
      </div>

      {cashBox && isAddMovementDialogOpen && (
        <AddMovementDialog
          isOpen={isAddMovementDialogOpen}
          onClose={() => setIsAddMovementDialogOpen(false)}
          cashBox={cashBox}
          onSuccess={handleDialogSuccess}
        />
      )}

      {cashBox && isOpenDialogOpen && (
        <OpenCashBoxDialog
          isOpen={isOpenDialogOpen}
          onClose={() => setIsOpenDialogOpen(false)}
          cashBox={cashBox}
          onSuccess={handleDialogSuccess}
        />
      )}

      {cashBox && isCloseDialogOpen && (
        <CloseCashBoxDialog
          isOpen={isCloseDialogOpen}
          onClose={() => setIsCloseDialogOpen(false)}
          cashBox={cashBox}
          onSuccess={handleDialogSuccess}
        />
      )}
    </div>
  )
}
