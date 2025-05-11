"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LockOpen, Lock, ArrowRight } from "lucide-react"
import type { CashBox } from "@/lib/types/cashier"
import { formatCurrency } from "@/lib/utils"

interface CashBoxCardProps {
  cashBox: CashBox
  onOpen: (id: string) => void
  onClose: (id: string) => void
}

export function CashBoxCard({ cashBox, onOpen, onClose }: CashBoxCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className={cashBox.isOpen ? "border-green-500" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{cashBox.name}</CardTitle>
            <CardDescription>
              {cashBox.isOpen ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Abierta
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  Cerrada
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cashBox.isOpen ? (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Monto inicial:</span>
                <span className="font-medium">{formatCurrency(cashBox.initialAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Monto actual:</span>
                <span className="font-medium">{formatCurrency(cashBox.expectedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Abierta el:</span>
                <span className="text-sm">{formatDate(cashBox.openedAt)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Monto final:</span>
                <span className="font-medium">{formatCurrency(cashBox.currentAmount)}</span>
              </div>
              {cashBox.difference !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Diferencia:</span>
                  <span
                    className={`font-medium ${cashBox.difference < 0 ? "text-red-500" : cashBox.difference > 0 ? "text-green-500" : ""}`}
                  >
                    {formatCurrency(cashBox.difference)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Cerrada el:</span>
                <span className="text-sm">{formatDate(cashBox.closedAt)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {cashBox.isOpen ? (
          <Button variant="outline" className="w-full" onClick={() => onClose(cashBox.id)}>
            <Lock className="h-4 w-4 mr-2" />
            Cerrar Caja
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => onOpen(cashBox.id)}>
            <LockOpen className="h-4 w-4 mr-2" />
            Abrir Caja
          </Button>
        )}
        <Button variant="ghost" className="w-full" asChild>
          <a href={`/tenant/${cashBox.tenantId}/admin/cashier/${cashBox.id}`}>
            Detalles
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
