"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { OpenCashRegisterDialog } from "./open-cash-register-dialog"
import { CloseCashRegisterDialog } from "./close-cash-register-dialog"
import { DollarSign, Lock, Unlock } from "lucide-react"

export function CashRegisterStatus({
  tenantId,
  branchId,
}: {
  tenantId: string
  branchId: string
}) {
  const { isOpen, loading } = useCashRegister()
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center h-9 px-4 py-2 text-sm bg-gray-100 text-gray-500 rounded-md animate-pulse">
        Cargando...
      </div>
    )
  }

  if (isOpen) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center h-9 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md">
          <Unlock className="h-4 w-4 mr-2" />
          Caja Abierta
        </div>
        <Button variant="outline" size="sm" onClick={() => setCloseDialogOpen(true)}>
          <Lock className="h-4 w-4 mr-2" />
          Cerrar Caja
        </Button>

        <CloseCashRegisterDialog
          tenantId={tenantId}
          branchId={branchId}
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center h-9 px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md">
        <Lock className="h-4 w-4 mr-2" />
        Caja Cerrada
      </div>
      <Button variant="outline" size="sm" onClick={() => setOpenDialogOpen(true)}>
        <DollarSign className="h-4 w-4 mr-2" />
        Abrir Caja
      </Button>

      <OpenCashRegisterDialog
        tenantId={tenantId}
        branchId={branchId}
        open={openDialogOpen}
        onOpenChange={setOpenDialogOpen}
      />
    </div>
  )
}
