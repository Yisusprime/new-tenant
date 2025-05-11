"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { NewOrderDrawer } from "./new-order-drawer"

interface NewOrderButtonProps {
  tenantId: string
  branchId: string
  onOrderCreated: () => void
}

export function NewOrderButton({ tenantId, branchId, onOrderCreated }: NewOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nuevo Pedido
      </Button>

      <NewOrderDrawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantId={tenantId}
        branchId={branchId}
        onOrderCreated={onOrderCreated}
      />
    </>
  )
}
