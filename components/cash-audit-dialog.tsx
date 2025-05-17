"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CashAuditForm } from "./cash-audit-form"
import { CashAuditDetails } from "./cash-audit-details"
import type { CashRegister } from "@/lib/types/cash-register"

interface CashAuditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  onSuccess?: () => void
}

export function CashAuditDialog({
  open,
  onOpenChange,
  tenantId,
  branchId,
  userId,
  register,
  onSuccess,
}: CashAuditDialogProps) {
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null)

  const handleSuccess = (auditId: string) => {
    setCurrentAuditId(auditId)
    if (onSuccess) {
      onSuccess()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Resetear el estado después de cerrar
    setTimeout(() => {
      setCurrentAuditId(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{currentAuditId ? "Resultado del Arqueo de Caja" : "Realizar Arqueo de Caja"}</DialogTitle>
          <DialogDescription>
            {currentAuditId
              ? "Revise los detalles del arqueo realizado."
              : "Verifique el efectivo físico en la caja y registre el resultado."}
          </DialogDescription>
        </DialogHeader>

        {currentAuditId ? (
          <CashAuditDetails tenantId={tenantId} branchId={branchId} auditId={currentAuditId} />
        ) : (
          <CashAuditForm
            tenantId={tenantId}
            branchId={branchId}
            userId={userId}
            register={register}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
