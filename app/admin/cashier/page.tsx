"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { CashierProvider, useCashier } from "@/components/cashier/cashier-context"
import { OpenSessionForm } from "@/components/cashier/open-session-form"
import { CloseSessionForm } from "@/components/cashier/close-session-form"
import { SessionSummary } from "@/components/cashier/session-summary"
import { SessionHistory } from "@/components/cashier/session-history"
import { SalesChart } from "@/components/cashier/sales-chart"

function CashierDashboard() {
  const { currentSession } = useCashier()
  const [activeTab, setActiveTab] = useState("current")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Cierre de Caja</h1>

        {currentSession ? <Button variant="destructive">Cerrar Caja</Button> : <Button>Abrir Caja</Button>}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Sesión Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="reports">Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          {currentSession ? (
            <div className="space-y-6">
              <SessionSummary />
              <CloseSessionForm />
            </div>
          ) : (
            <OpenSessionForm />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SessionHistory />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <SalesChart />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CashierPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tenantId = user?.tenantId || searchParams.get("tenantId") || ""

  if (!tenantId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          No se ha encontrado un tenant válido. Por favor, inicia sesión o proporciona un ID de tenant.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <CashierProvider tenantId={tenantId}>
        <CashierDashboard />
      </CashierProvider>
    </div>
  )
}
