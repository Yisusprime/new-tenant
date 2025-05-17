"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CashAuditForm } from "@/components/cash-audit-form"
import type { CashRegister } from "@/lib/types/cash-register"

interface CashAuditDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (auditId: string) => void
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  expectedCash?: number
}

export function CashAuditDialog({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
  branchId,
  userId,
  register,
  expectedCash,
}: CashAuditDialogProps) {
  const handleSuccess = (auditId: string) => {
    onSuccess(auditId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Arqueo de Caja: {register.name}</DialogTitle>
        </DialogHeader>
        <CashAuditForm
          tenantId={tenantId}
          branchId={branchId}
          userId={userId}
          register={register}
          onSuccess={handleSuccess}
          onCancel={onClose}
          expectedCash={expectedCash}
        />
      </DialogContent>
    </Dialog>
  )
}
