"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderList } from "./order-list"
import type { OrderType } from "@/lib/types/order"
import { UtensilsCrossed, Car, ShoppingBag, Package } from "lucide-react"
import { NewOrderButton } from "./new-order-button"

interface OrderTabsProps {
  tenantId: string
  branchId: string
}

export function OrderTabs({ tenantId, branchId }: OrderTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const getOrderType = (): OrderType | undefined => {
    switch (activeTab) {
      case "dine_in":
        return "dine_in"
      case "takeaway":
        return "takeaway"
      case "delivery":
        return "delivery"
      default:
        return undefined
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <NewOrderButton tenantId={tenantId} branchId={branchId} onOrderCreated={handleRefresh} />
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Todos</span>
          </TabsTrigger>
          <TabsTrigger value="dine_in" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Mesas</span>
          </TabsTrigger>
          <TabsTrigger value="takeaway" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Para llevar</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <OrderList tenantId={tenantId} branchId={branchId} refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="dine_in" className="mt-6">
          <OrderList tenantId={tenantId} branchId={branchId} type="dine_in" refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="takeaway" className="mt-6">
          <OrderList tenantId={tenantId} branchId={branchId} type="takeaway" refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="delivery" className="mt-6">
          <OrderList tenantId={tenantId} branchId={branchId} type="delivery" refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
