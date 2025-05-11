"use client"

import { useState } from "react"
import { OrderTabs } from "@/components/orders/order-tabs"
import { OrderList } from "@/components/orders/order-list"
import { NewOrderButton } from "@/components/orders/new-order-button"
import { useBranch } from "@/lib/hooks/use-branch"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function OrdersPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { selectedBranch } = useBranch()
  const [activeTab, setActiveTab] = useState("all")

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <NewOrderButton tenantId={tenantId} branchId={selectedBranch.id} />
      </div>

      <OrderTabs activeTab={activeTab} onChange={setActiveTab} />
      <OrderList tenantId={tenantId} branchId={selectedBranch.id} activeTab={activeTab} />
    </div>
  )
}
