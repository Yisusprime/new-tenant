"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { OrdersList } from "./components/orders-list"
import { TablesList } from "./components/tables-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { useOrderNotifications } from "@/lib/hooks/use-order-notifications"
import { OrderNotification } from "@/components/order-notification"
import { NotificationSettings } from "@/components/notification-settings"
import { VisualNotification } from "@/components/visual-notification"
import { PageContainer } from "@/components/page-container"

export default function OrdersPage() {
  const params = useParams<{ tenantId: string }>()
  const { currentBranch } = useBranch()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("orders")
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const { newOrders, clearNewOrders, notificationSettings, updateNotificationSettings } = useOrderNotifications(
    params.tenantId,
    currentBranch?.id,
  )

  // Redirigir a la página de historial
  const goToHistory = () => {
    router.push(`/admin/orders/history`)
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
            <p className="text-muted-foreground">Administre los pedidos activos y mesas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setCreateOrderOpen(true)}>Nuevo Pedido</Button>
            <Button variant="outline" onClick={goToHistory}>
              Ver Historial
            </Button>
          </div>
        </div>

        {!currentBranch ? (
          <NoBranchSelectedAlert />
        ) : (
          <>
            <div className="flex justify-between items-center">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="orders">Pedidos Activos</TabsTrigger>
                  <TabsTrigger value="tables">Mesas</TabsTrigger>
                </TabsList>
              </Tabs>
              <NotificationSettings settings={notificationSettings} onSettingsChange={updateNotificationSettings} />
            </div>

            <TabsContent value="orders" className="mt-0">
              <OrdersList
                tenantId={params.tenantId}
                branchId={currentBranch.id}
                onCreateOrder={() => setCreateOrderOpen(true)}
              />
            </TabsContent>

            <TabsContent value="tables" className="mt-0">
              <TablesList
                tenantId={params.tenantId}
                branchId={currentBranch.id}
                onCreateOrder={() => setCreateOrderOpen(true)}
              />
            </TabsContent>
          </>
        )}

        {/* Diálogo para crear nuevo pedido */}
        <CreateOrderDialog
          open={createOrderOpen}
          onOpenChange={setCreateOrderOpen}
          tenantId={params.tenantId}
          branchId={currentBranch?.id || ""}
        />

        {/* Notificación de audio para nuevos pedidos */}
        {newOrders.length > 0 && (
          <OrderNotification orders={newOrders} onDismiss={clearNewOrders} playSound={notificationSettings.sound} />
        )}

        {/* Notificación visual para nuevos pedidos */}
        {newOrders.length > 0 && notificationSettings.visual && (
          <VisualNotification
            message={`${newOrders.length} ${newOrders.length === 1 ? "nuevo pedido" : "nuevos pedidos"}`}
          />
        )}
      </div>
    </PageContainer>
  )
}
