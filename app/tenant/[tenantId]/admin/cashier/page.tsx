"use client"

import { useState } from "react"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { CashBoxCard } from "./components/cash-box-card"
import { OpenCashBoxDialog } from "./components/open-cash-box-dialog"
import { CloseCashBoxDialog } from "./components/close-cash-box-dialog"
import { CreateCashBoxDialog } from "./components/create-cash-box-dialog"
import { CategoriesDialog } from "./components/categories-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusIcon, TagsIcon } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"

export default function CashierPage() {
  const { tenantId, currentBranch, hasActiveBranches } = useBranch()
  const { cashBoxes, loading, error, loadCashBoxes } = useCashBox()

  const [selectedCashBoxId, setSelectedCashBoxId] = useState<string | null>(null)
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)

  const selectedCashBox = selectedCashBoxId ? cashBoxes.find((box) => box.id === selectedCashBoxId) : null

  const handleOpenCashBox = (cashBoxId: string) => {
    setSelectedCashBoxId(cashBoxId)
    setIsOpenDialogOpen(true)
  }

  const handleCloseCashBox = (cashBoxId: string) => {
    setSelectedCashBoxId(cashBoxId)
    setIsCloseDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    loadCashBoxes()
  }

  if (!currentBranch || !hasActiveBranches) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Caja</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCategoriesDialogOpen(true)}>
            <TagsIcon className="h-4 w-4 mr-2" />
            Categorías
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Caja
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Cajas Activas</TabsTrigger>
          <TabsTrigger value="closed">Cajas Cerradas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-500">Error al cargar las cajas: {error}</div>
              </CardContent>
            </Card>
          ) : cashBoxes.filter((box) => box.status === "active").length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No hay cajas activas. Crea una nueva caja para comenzar.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cashBoxes
                .filter((box) => box.status === "active")
                .map((cashBox) => (
                  <CashBoxCard
                    key={cashBox.id}
                    cashBox={cashBox}
                    onOpen={handleOpenCashBox}
                    onClose={handleCloseCashBox}
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-500">Error al cargar las cajas: {error}</div>
              </CardContent>
            </Card>
          ) : cashBoxes.filter((box) => box.status === "closed").length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">No hay cajas cerradas.</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cashBoxes
                .filter((box) => box.status === "closed")
                .map((cashBox) => (
                  <CashBoxCard
                    key={cashBox.id}
                    cashBox={cashBox}
                    onOpen={handleOpenCashBox}
                    onClose={handleCloseCashBox}
                  />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedCashBox && isOpenDialogOpen && (
        <OpenCashBoxDialog
          isOpen={isOpenDialogOpen}
          onClose={() => setIsOpenDialogOpen(false)}
          cashBox={selectedCashBox}
          onSuccess={handleDialogSuccess}
        />
      )}

      {selectedCashBox && isCloseDialogOpen && (
        <CloseCashBoxDialog
          isOpen={isCloseDialogOpen}
          onClose={() => setIsCloseDialogOpen(false)}
          cashBox={selectedCashBox}
          onSuccess={handleDialogSuccess}
        />
      )}

      <CreateCashBoxDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      {tenantId && (
        <CategoriesDialog
          isOpen={isCategoriesDialogOpen}
          onClose={() => setIsCategoriesDialogOpen(false)}
          tenantId={tenantId}
        />
      )}
    </div>
  )
}
