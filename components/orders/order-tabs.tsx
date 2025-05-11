"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function OrderTabs({ activeTab, onTabChange }: OrderTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-4 w-full md:w-auto">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="dine_in">Mesas</TabsTrigger>
        <TabsTrigger value="takeaway">Para llevar</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
