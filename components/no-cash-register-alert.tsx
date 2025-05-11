"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { useState } from "react"
import { OpenCashRegisterDialog } from "./open-cash-register-dialog"

export function NoCashRegisterAlert({
  tenantId,
  branchId,
}: {
  tenantId: string
  branchId: string
}) {
  const { isOpen, loading } = useCashRegister()
  const [openDialogOpen, setOpenDialogOpen] = useState(false)

  if (loading || isOpen) {
    return null
  }

  return (
    <>
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No hay una caja abierta</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Debes abrir una caja para poder crear pedidos.</span>
          <Button variant="outline" size="sm" onClick={() => setOpenDialogOpen(true)}>
            Abrir Caja
          </Button>
        </AlertDescription>
      </Alert>

      <OpenCashRegisterDialog
        tenantId={tenantId}
        branchId={branchId}
        open={openDialogOpen}
        onOpenChange={setOpenDialogOpen}
      />
    </>
  )
}
