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
import { Plus } from "lucide-react"

export default function OrdersPage() {
  const params = useParams()
  const tenantId = params.tenantId as string
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
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
            <OrderProvider tenantId={tenantId}>
              <TableProvider tenantId={tenantId}>
                <NewOrderForm tenantId={tenantId} onClose={() => setIsNewOrderOpen(false)} />
              </TableProvider>
            </OrderProvider>
          </SheetContent>
        </Sheet>
      </div>

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
          <TableProvider tenantId={tenantId}>
            <TableList />
          </TableProvider>
        </TabsContent>
        <TabsContent value="delivery" className="mt-4">
          <OrderProvider tenantId={tenantId}>
            <DeliveryList />
          </OrderProvider>
        </TabsContent>
      </Tabs>
    </div>
  )
}
