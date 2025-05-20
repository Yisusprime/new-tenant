"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CashMovementForm } from "@/components/cash-movement-form"
import { CashRegisterCloseForm } from "@/components/cash-register-close-form"
import { CashRegisterSummary } from "@/components/cash-register-summary"
import { OpenCashRegisterDialog } from "./components/open-cash-register-dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRestaurantConfig } from "@/lib/hooks/use-restaurant-config"
import { getActiveCashRegister, getCashRegisterHistory, type CashRegister } from "@/lib/services/cash-register-service"
import {
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Clock,
  User,
  DollarSign,
  Banknote,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { PageContainer } from "@/components/page-container"

export default function CashRegisterPage() {
  const params = useParams<{ tenantId: string }>()
  const { currentBranch } = useBranch()
  const router = useRouter()
  const { toast } = useToast()
  const [activeRegister, setActiveRegister] = useState<CashRegister | null>(null)
  const [recentRegisters, setRecentRegisters] = useState<CashRegister[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("summary")

  // Obtener la configuración del restaurante para el formato de moneda
  const { data: restaurantConfig } = useRestaurantConfig(params.tenantId, "basicInfo", {
    currencyCode: "CLP",
  })

  // Obtener el código de moneda configurado
  const currencyCode = restaurantConfig?.currencyCode || "CLP"

  // Cargar datos de la caja
  useEffect(() => {
    async function loadCashRegisterData() {
      if (!currentBranch) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Obtener caja activa
        const active = await getActiveCashRegister(params.tenantId, currentBranch.id)
        setActiveRegister(active)

        // Obtener historial reciente
        const history = await getCashRegisterHistory(params.tenantId, currentBranch.id, 5)
        setRecentRegisters(history)
      } catch (error) {
        console.error("Error al cargar datos de caja:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de la caja",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCashRegisterData()
  }, [params.tenantId, currentBranch, toast])

  // Función para actualizar los datos después de abrir/cerrar caja
  const refreshData = async () => {
    if (!currentBranch) return

    try {
      // Obtener caja activa
      const active = await getActiveCashRegister(params.tenantId, currentBranch.id)
      setActiveRegister(active)

      // Obtener historial reciente
      const history = await getCashRegisterHistory(params.tenantId, currentBranch.id, 5)
      setRecentRegisters(history)
    } catch (error) {
      console.error("Error al actualizar datos de caja:", error)
    }
  }

  // Función para abrir la caja
  const handleOpenRegister = () => {
    setOpenDialogOpen(true)
  }

  // Función para ver movimientos de una caja
  const viewRegisterMovements = (registerId: string) => {
    router.push(`/admin/cash-register/movements/${registerId}`)
  }

  // Función para ver auditorías de una caja
  const viewRegisterAudits = (registerId: string) => {
    router.push(`/admin/cash-register/audits/${registerId}`)
  }

  // Función para ver el historial completo
  const viewFullHistory = () => {
    router.push(`/admin/cash-register/history`)
  }

  // Renderizar el estado de la caja
  const renderCashRegisterStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }

    if (!activeRegister) {
      return (
        <Card className="border-dashed border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            </CardTitle>
            <CardTitle>Caja Cerrada</CardTitle>
            <CardDescription>No hay una caja abierta actualmente</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Debe abrir la caja para registrar ventas y movimientos de efectivo.</p>
            <Button onClick={handleOpenRegister} className="w-full">
              Abrir Caja
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-green-500" />
                Caja Abierta
              </CardTitle>
              <CardDescription>
                Abierta el {formatDate(activeRegister.openedAt)} por {activeRegister.openedBy}
              </CardDescription>
            </div>
            <Badge className="bg-green-500">Activa</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Saldo Inicial
              </div>
              <div className="text-xl font-semibold">{formatCurrency(activeRegister.initialAmount, currencyCode)}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Tiempo Abierta
              </div>
              <div className="text-xl font-semibold">{getTimeOpen(activeRegister.openedAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                Ingresos
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(activeRegister.currentBalance?.income || 0, currencyCode)}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                Egresos
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(activeRegister.currentBalance?.expense || 0, currencyCode)}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Banknote className="h-4 w-4 mr-1 text-blue-500" />
                Saldo Actual
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(
                  (activeRegister.initialAmount || 0) +
                    (activeRegister.currentBalance?.income || 0) -
                    (activeRegister.currentBalance?.expense || 0),
                  currencyCode,
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Efectivo</div>
              <div className="text-sm font-medium">
                {formatCurrency(activeRegister.currentBalance?.byCashMethod?.cash || 0, currencyCode)}
              </div>
            </div>
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Tarjeta</div>
              <div className="text-sm font-medium">
                {formatCurrency(activeRegister.currentBalance?.byCashMethod?.card || 0, currencyCode)}
              </div>
            </div>
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Transferencia</div>
              <div className="text-sm font-medium">
                {formatCurrency(activeRegister.currentBalance?.byCashMethod?.transfer || 0, currencyCode)}
              </div>
            </div>
            <div className="p-2 border rounded-lg text-center">
              <div className="text-xs text-muted-foreground mb-1">Otros</div>
              <div className="text-sm font-medium">
                {formatCurrency(
                  (activeRegister.currentBalance?.byCashMethod?.app || 0) +
                    (activeRegister.currentBalance?.byCashMethod?.other || 0),
                  currencyCode,
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => viewRegisterMovements(activeRegister.id)}
          >
            Ver Movimientos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => viewRegisterAudits(activeRegister.id)}
          >
            Ver Auditorías
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Función para calcular el tiempo que lleva abierta la caja
  function getTimeOpen(openedAt: string): string {
    const now = new Date()
    const opened = new Date(openedAt)
    const diffMs = now.getTime() - opened.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`
    } else {
      return `${diffMins} minutos`
    }
  }

  if (!currentBranch) {
    return <NoBranchSelectedAlert />
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Caja</h1>
            <p className="text-muted-foreground">Administre los movimientos de efectivo y cierre de caja</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {activeRegister ? (
              <Button variant="outline" onClick={viewFullHistory}>
                Ver Historial
              </Button>
            ) : (
              <Button onClick={handleOpenRegister}>Abrir Caja</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de la caja */}
          <div className="lg:col-span-1">{renderCashRegisterStatus()}</div>

          {/* Formularios y acciones */}
          <div className="lg:col-span-2">
            {activeRegister ? (
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">Resumen</TabsTrigger>
                      <TabsTrigger value="movement">Movimiento</TabsTrigger>
                      <TabsTrigger value="close">Cerrar Caja</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="summary" className="mt-0">
                    <CashRegisterSummary
                      register={activeRegister}
                      currencyCode={currencyCode}
                      onViewMovements={() => viewRegisterMovements(activeRegister.id)}
                    />
                  </TabsContent>
                  <TabsContent value="movement" className="mt-0">
                    <CashMovementForm
                      tenantId={params.tenantId}
                      branchId={currentBranch.id}
                      registerId={activeRegister.id}
                      onSuccess={refreshData}
                    />
                  </TabsContent>
                  <TabsContent value="close" className="mt-0">
                    <CashRegisterCloseForm
                      tenantId={params.tenantId}
                      branchId={currentBranch.id}
                      register={activeRegister}
                      currencyCode={currencyCode}
                      onSuccess={() => {
                        refreshData()
                        setActiveTab("summary")
                      }}
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Historial Reciente</CardTitle>
                  <CardDescription>Últimas cajas cerradas</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="border-b my-4"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentRegisters.length > 0 ? (
                    <div className="space-y-4">
                      {recentRegisters.map((register) => (
                        <div key={register.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">
                                Caja del {formatDate(register.openedAt, { includeTime: false })}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                <User className="inline h-3.5 w-3.5 mr-1" />
                                {register.openedBy}
                              </p>
                            </div>
                            <Badge variant="outline">Cerrada</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                              <p className="text-xs text-muted-foreground">Inicial</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(register.initialAmount, currencyCode)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Final</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(register.finalAmount || 0, currencyCode)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Diferencia</p>
                              <p
                                className={`text-sm font-medium ${
                                  (register.difference || 0) >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {formatCurrency(register.difference || 0, currencyCode)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => viewRegisterMovements(register.id)}
                            >
                              <FileText className="h-3 w-3 mr-1" /> Movimientos
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => viewRegisterAudits(register.id)}
                            >
                              <History className="h-3 w-3 mr-1" /> Auditorías
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">No hay registros de cajas anteriores</div>
                  )}
                </CardContent>
                {recentRegisters.length > 0 && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={viewFullHistory}>
                      <History className="mr-2 h-4 w-4" />
                      Ver Historial Completo
                    </Button>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo para abrir caja */}
      <OpenCashRegisterDialog
        open={openDialogOpen}
        onOpenChange={setOpenDialogOpen}
        tenantId={params.tenantId}
        branchId={currentBranch.id}
        onSuccess={refreshData}
      />
    </PageContainer>
  )
}
