"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { OrderProvider } from "@/components/orders/order-context"
import { TableProvider } from "@/components/orders/table-context"
import { OrderList } from "@/components/orders/order-list"
import { TableList } from "@/components/orders/table-list"
import { DeliveryList } from "@/components/orders/delivery-list"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Menu } from "lucide-react"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"

export default function OrdersPage() {
  const { user } = useAuth()
  const params = useParams()
  // Usar el tenantId del usuario autenticado, no el valor predeterminado "demo"
  const tenantId = user?.tenantId || (params.tenantId as string)

  console.log("OrdersPage - Using tenant ID:", tenantId)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
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
            <h1 className="text-xl font-bold">Gestión de Pedidos</h1>
          </div>

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
              {console.log("Inicializando proveedores con tenantId:", tenantId)}
              <OrderProvider tenantId={tenantId}>
                <TableProvider tenantId={tenantId}>
                  <NewOrderForm tenantId={tenantId} onClose={() => setIsNewOrderOpen(false)} />
                </TableProvider>
              </OrderProvider>
            </SheetContent>
          </Sheet>
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <OrderProvider tenantId={tenantId}>
                <OrderList />
              </OrderProvider>
            </TabsContent>
            <TabsContent value="tables" className="mt-4">
              <OrderProvider tenantId={tenantId}>
                <TableProvider tenantId={tenantId}>
                  <TableList />
                </TableProvider>
              </OrderProvider>
            </TabsContent>
            <TabsContent value="delivery" className="mt-4">
              <OrderProvider tenantId={tenantId}>
                <DeliveryList />
              </OrderProvider>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
