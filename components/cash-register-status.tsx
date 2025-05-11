"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { OpenCashRegisterDialog } from "./open-cash-register-dialog"
import { CloseCashRegisterDialog } from "./close-cash-register-dialog"
import { CheckCircle2, XCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import type { CashRegister } from "@/lib/types/cash-register"

interface CashRegisterStatusProps {
  tenantId: string
  branchId: string
}

export function CashRegisterStatus({ tenantId, branchId }: CashRegisterStatusProps) {
  const { currentCashRegister, isOpen, loading } = useCashRegister()
  const [openDialog, setOpenDialog] = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)
  const router = useRouter()

  const handleCloseCashRegisterSuccess = (cashRegister: CashRegister) => {
    // Redirigir a la página de detalles de la caja cerrada
    router.push(`/tenant/${tenantId}/admin/cash-register/${cashRegister.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        {isOpen ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              Caja abierta ({formatDateTime(currentCashRegister?.openedAt || "")})
            </span>
            <Button variant="outline" size="sm" onClick={() => setCloseDialog(true)}>
              Cerrar Caja
            </Button>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Caja cerrada</span>
            <Button variant="outline" size="sm" onClick={() => setOpenDialog(true)}>
              Abrir Caja
            </Button>
          </>
        )}
      </div>

      <OpenCashRegisterDialog tenantId={tenantId} branchId={branchId} open={openDialog} onOpenChange={setOpenDialog} />

      <CloseCashRegisterDialog
        tenantId={tenantId}
        branchId={branchId}
        open={closeDialog}
        onOpenChange={setCloseDialog}
        onSuccess={handleCloseCashRegisterSuccess}
      />
    </>
  )
}
