"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderTabsProps {
  tenantId: string
  branchId: string
  activeTab: string
  onTabChange: (tab: string) => void
}

export function OrderTabs({ tenantId, branchId, activeTab, onTabChange }: OrderTabsProps) {
  return (
    <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="dine_in">Mesas</TabsTrigger>
        <TabsTrigger value="takeaway">Para llevar</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
