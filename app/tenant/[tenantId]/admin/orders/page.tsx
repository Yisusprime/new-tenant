"use client"

import { useState } from "react"
import { useBranch } from "@/lib/hooks/use-branch"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { OrderTabs } from "@/components/orders/order-tabs"
import { OrderList } from "@/components/orders/order-list"
import { NewOrderButton } from "@/components/orders/new-order-button"

interface OrdersPageProps {
  params: {
    tenantId: string
  }
}

export default function OrdersPage({ params }: OrdersPageProps) {
  const { tenantId } = params
  const { selectedBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("all")

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <NewOrderButton
          tenantId={tenantId}
          branchId={selectedBranch.id}
          onOrderCreated={() => {
            // Refrescar la lista de pedidos
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <OrderList tenantId={tenantId} branchId={selectedBranch.id} activeTab={activeTab} />
    </div>
  )
}
