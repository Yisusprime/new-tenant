"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { OpenCashRegisterDialog } from "./open-cash-register-dialog"

interface NoCashRegisterAlertProps {
  tenantId: string
  branchId: string
}

export function NoCashRegisterAlert({ tenantId, branchId }: NoCashRegisterAlertProps) {
  const { isOpen, loading } = useCashRegister()
  const [openDialog, setOpenDialog] = useState(false)

  if (loading || isOpen) {
    return null
  }

  return (
    <>
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Caja cerrada</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Debes abrir la caja para poder crear nuevos pedidos.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenDialog(true)}
            className="ml-4 bg-white hover:bg-gray-100"
          >
            Abrir Caja
          </Button>
        </AlertDescription>
      </Alert>

      <OpenCashRegisterDialog tenantId={tenantId} branchId={branchId} open={openDialog} onOpenChange={setOpenDialog} />
    </>
  )
}
