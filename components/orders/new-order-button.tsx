"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { NewOrderModal } from "./new-order-modal"

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
        <PlusCircle className="h-4 w-4 mr-2" />
        Nuevo Pedido
      </Button>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenantId={tenantId}
        branchId={branchId}
        onOrderCreated={onOrderCreated}
      />
    </>
  )
}
