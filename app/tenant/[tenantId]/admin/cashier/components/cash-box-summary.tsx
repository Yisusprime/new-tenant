"use client"

import type { CashBoxSummary as CashBoxSummaryType } from "@/lib/types/cashier"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownIcon, ArrowUpIcon, BanknoteIcon, CalculatorIcon } from "lucide-react"

interface CashBoxSummaryProps {
  summary: CashBoxSummaryType
}

export function CashBoxSummary({ summary }: CashBoxSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
          <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalInitial)}</div>
          <p className="text-xs text-muted-foreground">Monto con el que se abrió la caja</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalIncome)}</div>
          <p className="text-xs text-muted-foreground">Total de ingresos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egresos</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(summary.totalExpense)}</div>
          <p className="text-xs text-muted-foreground">Total de egresos registrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <CalculatorIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(summary.balance)}
          </div>
          <p className="text-xs text-muted-foreground">Saldo inicial + ingresos - egresos</p>
        </CardContent>
      </Card>
    </div>
  )
}
