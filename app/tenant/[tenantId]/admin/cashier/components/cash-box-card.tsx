"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type { CashBox } from "@/lib/types/cashier"
import { CalendarIcon, Clock, DollarSign, LockIcon, UnlockIcon } from "lucide-react"

interface CashBoxCardProps {
  cashBox: CashBox
  onOpen: (id: string) => void
  onClose: (id: string) => void
}

export function CashBoxCard({ cashBox, onOpen, onClose }: CashBoxCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <Card className={cashBox.isOpen ? "border-green-500 border-2" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{cashBox.name}</CardTitle>
            <CardDescription>
              {cashBox.isOpen ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 mt-1">
                  <UnlockIcon className="h-3 w-3 mr-1" />
                  Abierta
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 mt-1">
                  <LockIcon className="h-3 w-3 mr-1" />
                  Cerrada
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">Monto actual</div>
            <div className="text-2xl font-bold">{formatCurrency(cashBox.currentAmount)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cashBox.isOpen && (
            <>
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  Abierta el:
                </div>
                <div>{formatDate(cashBox.openedAt)}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Monto inicial:
                </div>
                <div>{formatCurrency(cashBox.initialAmount)}</div>
              </div>
            </>
          )}
          {!cashBox.isOpen && cashBox.closedAt && (
            <>
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Cerrada el:
                </div>
                <div>{formatDate(cashBox.closedAt)}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Diferencia:
                </div>
                <div
                  className={
                    cashBox.difference && cashBox.difference < 0
                      ? "text-red-500"
                      : cashBox.difference && cashBox.difference > 0
                        ? "text-green-500"
                        : ""
                  }
                >
                  {cashBox.difference !== undefined ? formatCurrency(cashBox.difference) : "N/A"}
                </div>
              </div>
            </>
          )}
          {cashBox.notes && (
            <div className="text-sm mt-2">
              <div className="font-medium">Notas:</div>
              <div className="text-muted-foreground">{cashBox.notes}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {cashBox.isOpen ? (
          <Button variant="outline" className="w-full" onClick={() => onClose(cashBox.id)}>
            <LockIcon className="h-4 w-4 mr-2" />
            Cerrar Caja
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => onOpen(cashBox.id)}>
            <UnlockIcon className="h-4 w-4 mr-2" />
            Abrir Caja
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
