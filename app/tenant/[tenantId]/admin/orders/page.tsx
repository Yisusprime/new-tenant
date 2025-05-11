"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersList } from "./components/orders-list"
import { TablesList } from "./components/tables-list"
import { CreateOrderDialog } from "./components/create-order-dialog"
import { useBranch } from "@/lib/hooks/use-branch"
import { useOrderNotifications } from "@/lib/hooks/use-order-notifications"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function OrdersPage() {
  const router = useRouter()
  const { selectedBranch } = useBranch()
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false)
  const { newOrders, playSound } = useOrderNotifications(selectedBranch?.id)

  // Función para probar el sonido
  const testSound = () => {
    try {
      playSound()
    } catch (error) {
      console.error("Error al reproducir sonido:", error)
      alert("Error al reproducir sonido: " + error.message)
    }
  }

  if (!selectedBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Órdenes</h1>
          <p className="text-muted-foreground">Gestiona las órdenes de tu restaurante</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2" onClick={testSound}>
            <Volume2 className="h-4 w-4" />
            Probar sonido
          </Button>
          <Button onClick={() => setIsCreateOrderOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva orden
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">
            Órdenes
            {newOrders.length > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{newOrders.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="tables">Mesas</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="space-y-4">
          <OrdersList />
        </TabsContent>
        <TabsContent value="tables" className="space-y-4">
          <TablesList />
        </TabsContent>
      </Tabs>

      <CreateOrderDialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen} />
    </div>
  )
}
