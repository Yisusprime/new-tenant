"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, ClipboardCheck } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { closeCashRegister } from "@/lib/services/cash-register-service"
import { hasActiveOrders } from "@/lib/services/order-service"
import { getLastCashAudit } from "@/lib/services/cash-audit-service"
import type { CashRegister, CashRegisterSummary, CashAudit } from "@/lib/types/cash-register"
import { toast } from "@/components/ui/use-toast"
import { CashAuditDialog } from "./cash-audit-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CashRegisterCloseFormProps {
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  summary: CashRegisterSummary
  onSuccess: () => void
  onCancel: () => void
}

export function CashRegisterCloseForm({
  tenantId,
  branchId,
  userId,
  register,
  summary,
  onSuccess,
  onCancel,
}: CashRegisterCloseFormProps) {
  const [actualBalance, setActualBalance] = useState<number>(summary.expectedBalance)
  const [notes, setNotes] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [hasOrders, setHasOrders] = useState<boolean>(false)
  const [checkingOrders, setCheckingOrders] = useState<boolean>(true)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [lastAudit, setLastAudit] = useState<CashAudit | null>(null)
  const [auditDialogOpen, setAuditDialogOpen] = useState<boolean>(false)
  const [shouldShowAuditPrompt, setShouldShowAuditPrompt] = useState<boolean>(true)
  const [auditPromptOpen, setAuditPromptOpen] = useState<boolean>(false)

  // Verificar si hay pedidos activos y cargar el último arqueo
  useEffect(() => {
    const loadData = async () => {
      try {
        setCheckingOrders(true)

        // Verificar pedidos activos
        const activeOrders = await hasActiveOrders(tenantId, branchId)
        setHasOrders(activeOrders)

        // Cargar último arqueo
        const audit = await getLastCashAudit(tenantId, branchId, register.id)
        setLastAudit(audit)

        // Determinar si debemos mostrar el prompt de arqueo
        // Si no hay arqueo o el último arqueo es de hace más de 1 hora
        if (!audit) {
          setShouldShowAuditPrompt(true)
        } else {
          const auditTime = new Date(audit.performedAt).getTime()
          const currentTime = new Date().getTime()
          const hoursSinceAudit = (currentTime - auditTime) / (1000 * 60 * 60)

          // Si han pasado más de 1 hora desde el último arqueo, sugerir hacer uno nuevo
          setShouldShowAuditPrompt(hoursSinceAudit > 1)
        }
      } catch (error) {
        console.error("Error al verificar datos:", error)
      } finally {
        setCheckingOrders(false)

        // Si debemos mostrar el prompt de arqueo, mostrarlo después de cargar los datos
        if (shouldShowAuditPrompt) {
          setAuditPromptOpen(true)
        }
      }
    }

    loadData()
  }, [tenantId, branchId, register.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si hay pedidos activos, mostrar diálogo de confirmación
    if (hasOrders) {
      setConfirmDialogOpen(true)
      return
    }

    // Si no hay pedidos activos, proceder con el cierre
    await closeCashRegisterAction()
  }

  const closeCashRegisterAction = async () => {
    try {
      setLoading(true)
      await closeCashRegister(tenantId, branchId, register.id, userId, {
        actualBalance,
        notes,
      })
      toast({
        title: "Caja cerrada",
        description: "La caja se ha cerrado correctamente",
        variant: "default",
      })
      onSuccess()
    } catch (error) {
      console.error("Error al cerrar caja:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la caja",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setConfirmDialogOpen(false)
    }
  }

  const handleConfirmClose = () => {
    closeCashRegisterAction()
  }

  const handleAuditSuccess = () => {
    setAuditDialogOpen(false)
    // Recargar el último arqueo
    const loadLastAudit = async () => {
      try {
        const audit = await getLastCashAudit(tenantId, branchId, register.id)
        setLastAudit(audit)

        // Si el arqueo tiene una diferencia, actualizar el balance actual
        if (audit) {
          setActualBalance(audit.actualCash)
        }
      } catch (error) {
        console.error("Error al cargar último arqueo:", error)
      }
    }

    loadLastAudit()
  }

  // Función para manejar la respuesta del prompt de arqueo
  const handleAuditPromptResponse = (doAudit: boolean) => {
    setAuditPromptOpen(false)

    if (doAudit) {
      // Abrir el diálogo de arqueo
      setAuditDialogOpen(true)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {checkingOrders ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verificando pedidos activos...</span>
          </div>
        ) : hasOrders ? (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pedidos activos</AlertTitle>
            <AlertDescription>
              Hay pedidos activos pendientes. Se recomienda completar o cancelar todos los pedidos antes de cerrar la
              caja.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Mostrar información del último arqueo si existe */}
        {lastAudit && (
          <Alert
            variant={
              lastAudit.status === "balanced" ? "default" : lastAudit.status === "surplus" ? "info" : "destructive"
            }
          >
            <ClipboardCheck className="h-4 w-4" />
            <AlertTitle>Último arqueo: {formatCurrency(lastAudit.actualCash)}</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>
                {lastAudit.status === "balanced"
                  ? "La caja está cuadrada"
                  : lastAudit.status === "surplus"
                    ? `Sobrante de ${formatCurrency(lastAudit.difference)}`
                    : `Faltante de ${formatCurrency(Math.abs(lastAudit.difference))}`}
              </span>
              <Button variant="outline" size="sm" onClick={() => setAuditDialogOpen(true)}>
                Nuevo arqueo
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Balance Esperado:</span>
            <span className="font-bold">{formatCurrency(summary.expectedBalance)}</span>
          </div>

          <div>
            <Label htmlFor="actualBalance">Balance Real</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="actualBalance"
                type="number"
                value={actualBalance}
                onChange={(e) => setActualBalance(Number(e.target.value))}
                className="pl-8"
                required
              />
            </div>
          </div>

          {actualBalance !== summary.expectedBalance && (
            <Alert variant={actualBalance > summary.expectedBalance ? "success" : "destructive"}>
              <AlertTitle>{actualBalance > summary.expectedBalance ? "Sobrante" : "Faltante"} de caja</AlertTitle>
              <AlertDescription>
                Hay una diferencia de {formatCurrency(Math.abs(actualBalance - summary.expectedBalance))} entre el
                balance esperado y el real.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones sobre el cierre de caja"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cerrar Caja
          </Button>
        </div>
      </form>

      {/* Diálogo de confirmación para cerrar con pedidos activos */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar caja con pedidos activos?</AlertDialogTitle>
            <AlertDialogDescription>
              Hay pedidos activos pendientes. Si cierra la caja ahora, estos pedidos seguirán activos pero no podrán
              recibirse nuevos pedidos. ¿Desea continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Cerrar Caja</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para preguntar si desea realizar un arqueo antes de cerrar */}
      <AlertDialog open={auditPromptOpen} onOpenChange={setAuditPromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Realizar arqueo de caja?</AlertDialogTitle>
            <AlertDialogDescription>
              Se recomienda realizar un arqueo de caja antes de cerrar para verificar que el efectivo físico coincida
              con el registro del sistema. ¿Desea realizar un arqueo ahora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleAuditPromptResponse(false)}>
              No, continuar sin arqueo
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAuditPromptResponse(true)}>Sí, realizar arqueo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de arqueo de caja */}
      <CashAuditDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        tenantId={tenantId}
        branchId={branchId}
        userId={userId}
        register={register}
        onSuccess={handleAuditSuccess}
        expectedCash={summary.paymentMethodTotals.cash || 0}
        isClosing={true}
      />
    </>
  )
}
