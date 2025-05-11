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
import { OrderTicket } from "@/components/order-ticket"
import type { Order } from "@/lib/types/order"
import { Loader2 } from "lucide-react"

interface PrintTicketDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantName: string
  restaurantAddress?: string
  restaurantPhone?: string
  restaurantLogo?: string
}

export function PrintTicketDialog({
  order,
  open,
  onOpenChange,
  restaurantName,
  restaurantAddress,
  restaurantPhone,
  restaurantLogo,
}: PrintTicketDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const ticketRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    setIsPrinting(true)
    // Simulamos un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      if (ticketRef.current) {
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
          <DialogTitle>Vista previa del ticket</DialogTitle>
          <DialogDescription>
            Revise el ticket antes de imprimir. Puede ajustar la configuración de impresión en su navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <OrderTicket
            ref={ticketRef}
            order={order}
            restaurantName={restaurantName}
            restaurantAddress={restaurantAddress}
            restaurantPhone={restaurantPhone}
            restaurantLogo={restaurantLogo}
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
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
