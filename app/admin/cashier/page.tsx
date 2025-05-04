"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { CashierProvider } from "@/components/cashier/cashier-context"
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

export default function CashierPage() {
  const { user } = useAuth()
  const params = useParams()
  const tenantId = user?.tenantId || (params.tenantId as string)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
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
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Gestión de Caja</h1>
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <CashierProvider tenantId={tenantId}>
            <Tabs defaultValue="dashboard">
              <TabsList>
                <TabsTrigger value="dashboard">Panel</TabsTrigger>
                <TabsTrigger value="open">Abrir Caja</TabsTrigger>
                <TabsTrigger value="close">Cerrar Caja</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-4 space-y-6">
                <SessionSummary />
                <SalesChart />
              </TabsContent>

              <TabsContent value="open" className="mt-4">
                <OpenSessionForm />
              </TabsContent>

              <TabsContent value="close" className="mt-4">
                <CloseSessionForm />
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <SessionHistory />
              </TabsContent>
            </Tabs>
          </CashierProvider>
        </div>
      </div>
    </div>
  )
}
