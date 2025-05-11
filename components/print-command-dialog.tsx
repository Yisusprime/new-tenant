"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { KitchenOrder } from "@/components/kitchen-order"
import type { Order } from "@/lib/types/order"
import { Loader2 } from "lucide-react"

interface PrintCommandDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantName: string
}

export function PrintCommandDialog({ order, open, onOpenChange, restaurantName }: PrintCommandDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const commandRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    setIsPrinting(true)
    // Simulamos un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      if (commandRef.current) {
        window.print()
      }
      setIsPrinting(false)
    }, 100)
  }

  const handleAfterPrint = () => {
    setIsPrinting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vista previa de la comanda</DialogTitle>
          <DialogDescription>
            Revise la comanda para la cocina antes de imprimir. Esta versión solo incluye los productos a preparar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <KitchenOrder
            ref={commandRef}
            order={order}
            restaurantName={restaurantName}
            showPrintButton={false}
            onPrint={handleAfterPrint}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Imprimir Comanda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
