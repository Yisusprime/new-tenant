"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { OrdersList } from "./components/orders-list"
import { TablesList } from "./components/tables-list"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { OrderNotification } from "@/components/order-notification"
import { NotificationSettings } from "@/components/notification-settings"
import { CashRegisterProvider } from "@/lib/context/cash-register-context"
import { CashRegisterStatus } from "@/components/cash-register-status"
import { NoCashRegisterAlert } from "@/components/no-cash-register-alert"
import { Plus } from "lucide-react"

export default function OrdersPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  return (
    <CashRegisterProvider tenantId={tenantId} branchId={currentBranch?.id}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <div className="flex items-center gap-4">
            {currentBranch && <CashRegisterStatus tenantId={tenantId} branchId={currentBranch.id} />}
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
            <NotificationSettings />
          </div>
        </div>

        <NoBranchSelectedAlert />

        {currentBranch && <NoCashRegisterAlert tenantId={tenantId} branchId={currentBranch.id} />}

        {currentBranch && (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="preparing">En Preparación</TabsTrigger>
              <TabsTrigger value="ready">Listos</TabsTrigger>
              <TabsTrigger value="tables">Mesas</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <OrdersList tenantId={tenantId} branchId={currentBranch.id} filter="all" />
            </TabsContent>

            <TabsContent value="pending">
              <OrdersList tenantId={tenantId} branchId={currentBranch.id} filter="pending" />
            </TabsContent>

            <TabsContent value="preparing">
              <OrdersList tenantId={tenantId} branchId={currentBranch.id} filter="preparing" />
            </TabsContent>

            <TabsContent value="ready">
              <OrdersList tenantId={tenantId} branchId={currentBranch.id} filter="ready" />
            </TabsContent>

            <TabsContent value="tables">
              <TablesList tenantId={tenantId} branchId={currentBranch.id} />
            </TabsContent>
          </Tabs>
        )}

        <CreateOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} tenantId={tenantId} />

        {/* Componente para notificaciones de nuevos pedidos */}
        {currentBranch && <OrderNotification tenantId={tenantId} branchId={currentBranch.id} />}
      </div>
    </CashRegisterProvider>
  )
}
