"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingBag, MenuIcon } from "lucide-react"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { OrderList } from "@/components/orders/order-list"
import { TableList } from "@/components/orders/table-list"
import { DeliveryList } from "@/components/orders/delivery-list"
import { NewOrderForm } from "@/components/orders/new-order-form"
import { TableProvider } from "@/components/orders/table-context"
import { OrderProvider } from "@/components/orders/order-context"

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const tenantId = "demo" // Esto debería venir de un contexto o parámetro

  return (
    <OrderProvider>
      <TableProvider>
        <div className="flex h-screen bg-muted/40">
          {/* Sidebar móvil */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0">
              <TenantAdminSidebar tenantid={tenantId} />
            </SheetContent>
          </Sheet>

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <header className="bg-background border-b h-16 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <MenuIcon className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">Gestor de Pedidos</h1>
              </div>

              <Sheet open={newOrderOpen} onOpenChange={setNewOrderOpen}>
                <SheetTrigger asChild>
                  <Button>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Nuevo Pedido
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md w-full">
                  <NewOrderForm onComplete={() => setNewOrderOpen(false)} />
                </SheetContent>
              </Sheet>
            </header>

            {/* Contenido */}
            <div className="flex-1 overflow-auto p-4">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="all">Todos los Pedidos</TabsTrigger>
                  <TabsTrigger value="tables">Mesas</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Todos los Pedidos</CardTitle>
                      <CardDescription>Gestiona todos los pedidos activos del restaurante</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OrderList />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tables" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mesas</CardTitle>
                      <CardDescription>Gestiona las mesas y sus pedidos asociados</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TableList />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="delivery" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery</CardTitle>
                      <CardDescription>Gestiona los pedidos de delivery</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DeliveryList />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </TableProvider>
    </OrderProvider>
  )
}
