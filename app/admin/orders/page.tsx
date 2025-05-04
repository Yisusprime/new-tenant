"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { OrderProvider } from "@/components/orders/order-context"
import { TableProvider } from "@/components/orders/table-context"
import { ShiftProvider, useShiftContext } from "@/components/orders/shift-context"
import { OrderList } from "@/components/orders/order-list"
import { TableList } from "@/components/orders/table-list"
import { DeliveryList } from "@/components/orders/delivery-list"
import { OrderHistory } from "@/components/orders/order-history"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { EndShiftDialog } from "@/components/orders/end-shift-dialog"
import { StartShiftDialog } from "@/components/orders/start-shift-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Menu, Clock, History, AlertTriangle } from "lucide-react"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

function OrdersContent({
  tenantId,
  setIsSidebarOpen,
}: { tenantId: string; setIsSidebarOpen: (open: boolean) => void }) {
  const router = useRouter()
  const { currentShift, loading: shiftLoading } = useShiftContext()

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false)
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Verificar si hay un turno activo al cargar
  useEffect(() => {
    if (!shiftLoading && !currentShift) {
      // No hay turno activo, mostrar diálogo para iniciar turno
      setIsStartShiftOpen(true)
    }
  }, [shiftLoading, currentShift])

  if (shiftLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Cargando información del turno...</p>
        </div>
      </div>
    )
  }

  return (
    <OrderProvider tenantId={tenantId}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="lg:block">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Gestión de Pedidos</h1>

            {currentShift && (
              <div className="hidden md:flex items-center">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Turno activo desde {new Date(currentShift.startTime).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentShift ? (
              <>
                <Button variant="outline" onClick={() => setIsEndShiftOpen(true)} className="hidden sm:flex">
                  <Clock className="mr-2 h-4 w-4" />
                  Finalizar Turno
                </Button>

                <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                  <SheetTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo Pedido
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Nuevo Pedido</SheetTitle>
                    </SheetHeader>
                    <TableProvider tenantId={tenantId}>
                      <NewOrderForm tenantId={tenantId} onClose={() => setIsNewOrderOpen(false)} />
                    </TableProvider>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Button onClick={() => setIsStartShiftOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Iniciar Turno
              </Button>
            )}
          </div>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          {!currentShift ? (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                No hay un turno activo. Inicia un turno para comenzar a recibir pedidos.
              </AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Pedidos Activos</TabsTrigger>
                <TabsTrigger value="tables">Mesas</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  Historial
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <OrderList currentShiftId={currentShift.id} />
              </TabsContent>
              <TabsContent value="tables" className="mt-4">
                <TableProvider tenantId={tenantId}>
                  <TableList currentShiftId={currentShift.id} />
                </TableProvider>
              </TabsContent>
              <TabsContent value="delivery" className="mt-4">
                <DeliveryList currentShiftId={currentShift.id} />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <OrderHistory />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Diálogos de turno */}
        <StartShiftDialog
          open={isStartShiftOpen}
          onOpenChange={setIsStartShiftOpen}
          onComplete={() => {
            // Redirigir a abrir caja
            router.push("/admin/cashier?action=open")
          }}
          tenantId={tenantId}
        />

        <EndShiftDialog
          open={isEndShiftOpen}
          onOpenChange={setIsEndShiftOpen}
          onComplete={() => {
            setActiveTab("all")
            // Redirigir a cerrar caja
            router.push("/admin/cashier?action=close")
          }}
          tenantId={tenantId}
        />
      </div>
    </OrderProvider>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  const tenantId = user?.tenantId || (params.tenantId as string)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  console.log("OrdersPage - Using tenant ID:", tenantId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar móvil/desplegable - ahora siempre es desplegable, no fijo */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <TenantAdminSidebar tenantid={tenantId} />
        </SheetContent>
      </Sheet>

      {/* Contenido principal con todos los providers necesarios */}
      <ShiftProvider tenantId={tenantId}>
        <OrdersContent tenantId={tenantId} setIsSidebarOpen={setIsSidebarOpen} />
      </ShiftProvider>
    </div>
  )
}
