"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { CashierProvider, useCashier } from "@/components/cashier/cashier-context"
import { OpenSessionForm } from "@/components/cashier/open-session-form"
import { CloseSessionForm } from "@/components/cashier/close-session-form"
import { SessionSummary } from "@/components/cashier/session-summary"
import { SessionHistory } from "@/components/cashier/session-history"
import { SalesChart } from "@/components/cashier/sales-chart"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"

function CashierDashboard() {
  const { currentSession } = useCashier()
  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  // Determinar la pestaña activa basada en el parámetro de URL o el estado de la sesión
  const getDefaultTab = () => {
    if (action === "open") return "open"
    if (action === "close") return "close"
    return currentSession ? "dashboard" : "open"
  }

  const [activeTab, setActiveTab] = useState(getDefaultTab())

  // Actualizar la pestaña activa cuando cambian los parámetros de URL
  useEffect(() => {
    setActiveTab(getDefaultTab())
  }, [action, currentSession])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestión de Caja</h1>

        {currentSession && (
          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Caja abierta desde {new Date(currentSession.startTime).toLocaleTimeString()}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Panel</TabsTrigger>
          <TabsTrigger value="open">Abrir Caja</TabsTrigger>
          <TabsTrigger value="close">Cerrar Caja</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          {currentSession ? (
            <div className="space-y-6">
              <SessionSummary />
              <SalesChart />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay una sesión activa. Abre una caja para comenzar.</p>
              <Button onClick={() => setActiveTab("open")} className="mt-4">
                Abrir Caja
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="open" className="mt-6">
          <OpenSessionForm />
        </TabsContent>

        <TabsContent value="close" className="mt-6">
          <CloseSessionForm />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function CashierPage() {
  const { user } = useAuth()
  const params = useParams()
  const tenantId = user?.tenantId || (params.tenantId as string)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar para pantallas grandes (visible por defecto) */}
      <div className="hidden md:block w-64 h-full">
        <TenantAdminSidebar tenantid={tenantId} />
      </div>

      {/* Sidebar móvil/desplegable */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <TenantAdminSidebar tenantid={tenantId} />
        </SheetContent>
      </Sheet>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Gestión de Caja</h1>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <CashierProvider tenantId={tenantId}>
            <CashierDashboard />
          </CashierProvider>
        </div>
      </div>
    </div>
  )
}
