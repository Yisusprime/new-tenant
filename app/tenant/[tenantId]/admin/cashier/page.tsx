"use client"

import { useState, useEffect } from "react"
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
import { PlusIcon, TagsIcon, RefreshCw } from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { toast } from "@/components/ui/use-toast"

export default function CashierPage() {
  const { tenantId, currentBranch, hasActiveBranches } = useBranch()
  const { cashBoxes, loading, error, loadCashBoxes } = useCashBox()
  const [isInitialized, setIsInitialized] = useState(false)

  console.log("Estado de caja:", {
    loading,
    error,
    cashBoxesCount: cashBoxes.length,
    tenantId,
    branchId: currentBranch?.id,
    isInitialized,
  })

  const [selectedCashBoxId, setSelectedCashBoxId] = useState<string | null>(null)
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)

  const selectedCashBox = selectedCashBoxId ? cashBoxes.find((box) => box.id === selectedCashBoxId) : null

  useEffect(() => {
    // Marcar como inicializado después de la primera carga
    if (!isInitialized && !loading) {
      setIsInitialized(true)
    }
  }, [loading, isInitialized])

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

  const handleRefresh = () => {
    loadCashBoxes()
    toast({
      title: "Actualizando",
      description: "Actualizando lista de cajas...",
    })
  }

  const handleCreateCashBox = () => {
    if (!currentBranch || !tenantId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }
    setIsCreateDialogOpen(true)
  }

  if (!currentBranch || !hasActiveBranches) {
    return <NoBranchSelectedAlert />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Caja</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsCategoriesDialogOpen(true)}>
            <TagsIcon className="h-4 w-4 mr-2" />
            Categorías
          </Button>
          <Button onClick={handleCreateCashBox}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Caja
          </Button>
        </div>
      </div>

      {/* Panel de depuración - solo visible en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Información de depuración:</h3>
            <pre className="text-xs overflow-auto bg-yellow-100 p-2 rounded">
              {JSON.stringify(
                {
                  tenantId,
                  branchId: currentBranch?.id,
                  loading,
                  error,
                  cashBoxesCount: cashBoxes.length,
                  isInitialized,
                },
                null,
                2,
              )}
            </pre>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p className="font-semibold">Error al cargar las cajas:</p>
              <p>{error}</p>
              <Button variant="outline" className="mt-2" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Cajas Activas</TabsTrigger>
          <TabsTrigger value="closed">Cajas Cerradas</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading && !isInitialized ? (
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
          ) : cashBoxes.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  No hay cajas disponibles. Crea una nueva caja para comenzar.
                </div>
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
          {loading && !isInitialized ? (
            <Card>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
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
