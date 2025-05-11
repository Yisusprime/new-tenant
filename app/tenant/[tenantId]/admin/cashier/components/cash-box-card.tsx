"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CashBox } from "@/lib/types/cashier"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Lock, Unlock } from "lucide-react"

interface CashBoxCardProps {
  cashBox: CashBox
  onOpen: (cashBoxId: string) => void
  onClose: (cashBoxId: string) => void
}

export function CashBoxCard({ cashBox, onOpen, onClose }: CashBoxCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleViewDetails = () => {
    router.push(`/admin/cashier/${cashBox.id}`)
  }

  const handleOpen = async () => {
    setIsLoading(true)
    try {
      await onOpen(cashBox.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = async () => {
    setIsLoading(true)
    try {
      await onClose(cashBox.id)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{cashBox.name}</CardTitle>
          <Badge variant={cashBox.isOpen ? "success" : "secondary"}>{cashBox.isOpen ? "Abierta" : "Cerrada"}</Badge>
        </div>
        <CardDescription>
          {cashBox.isOpen
            ? `Abierta el ${formatDate(cashBox.openedAt)}`
            : cashBox.closedAt
              ? `Cerrada el ${formatDate(cashBox.closedAt)}`
              : "No ha sido abierta"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monto inicial:</span>
            <span className="font-medium">{formatCurrency(cashBox.initialAmount)}</span>
          </div>
          {cashBox.isOpen && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Monto actual (esperado):</span>
              <span className="font-medium">{formatCurrency(cashBox.expectedAmount)}</span>
            </div>
          )}
          {!cashBox.isOpen && cashBox.closedAt && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monto final:</span>
                <span className="font-medium">{formatCurrency(cashBox.currentAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Diferencia:</span>
                <span
                  className={`font-medium ${cashBox.difference && cashBox.difference < 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {cashBox.difference !== undefined ? formatCurrency(cashBox.difference) : "N/A"}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleViewDetails}>
          Ver detalles
        </Button>
        {cashBox.isOpen ? (
          <Button variant="destructive" onClick={handleClose} disabled={isLoading}>
            <Lock className="mr-2 h-4 w-4" />
            Cerrar caja
          </Button>
        ) : (
          <Button variant="default" onClick={handleOpen} disabled={isLoading}>
            <Unlock className="mr-2 h-4 w-4" />
            Abrir caja
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
