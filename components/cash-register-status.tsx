"use client"

import { Button } from "@/components/ui/button"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { formatCurrency } from "@/lib/utils"
import { CircleDollarSign, Lock, Unlock } from "lucide-react"

export function CashRegisterStatus({
  tenantId,
  branchId,
  onOpenDialog,
  onCloseDialog,
}: {
  tenantId: string
  branchId: string
  onOpenDialog?: () => void
  onCloseDialog?: () => void
}) {
  const { isOpen, currentCashRegister, isLoading } = useCashRegister()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <CircleDollarSign className="h-5 w-5" />
        <span>Cargando estado de caja...</span>
      </div>
    )
  }

  if (isOpen && currentCashRegister) {
    return (
      <div className="flex items-center">
        <div className="mr-4 flex items-center text-green-600">
          <Unlock className="h-5 w-5 mr-1" />
          <span className="font-medium">Caja Abierta</span>
        </div>
        <div className="text-sm text-gray-600 mr-4">
          Monto inicial: {formatCurrency(currentCashRegister.initialAmount)}
        </div>
        {onCloseDialog && (
          <Button size="sm" variant="outline" onClick={onCloseDialog}>
            Cerrar Caja
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <div className="mr-4 flex items-center text-red-600">
        <Lock className="h-5 w-5 mr-1" />
        <span className="font-medium">Caja Cerrada</span>
      </div>
      {onOpenDialog && (
        <Button size="sm" variant="outline" onClick={onOpenDialog}>
          Abrir Caja
        </Button>
      )}
    </div>
  )
}
