"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCashRegisters, getOpenCashRegisters, getCashRegisterSummary } from "@/lib/services/cash-register-service"
import { getLastCashAudit } from "@/lib/services/cash-audit-service"
import type { CashRegister, CashRegisterSummary, CashAudit } from "@/lib/types/cash-register"
import { CashRegisterForm } from "@/components/cash-register-form"
import { CashMovementForm } from "@/components/cash-movement-form"
import { CashRegisterCloseForm } from "@/components/cash-register-close-form"
import { CashRegisterSummary as CashRegisterSummaryComponent } from "@/components/cash-register-summary"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ClipboardCheck,
  History,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { closeCashRegister } from "@/lib/services/cash-register-service"
import { toast } from "@/components/ui/use-toast"
import { CashAuditForm } from "@/components/cash-audit-form"

export default function CashRegisterPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [registers, setRegisters] = useState<CashRegister[]>([])
  const [openRegisters, setOpenRegisters] = useState<CashRegister[]>([])
  const [selectedRegister, setSelectedRegister] = useState<CashRegister | null>(null)
  const [registerSummary, setRegisterSummary] = useState<CashRegisterSummary | null>(null)
  const [lastAudit, setLastAudit] = useState<CashAudit | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("open")
  const [isLoading, setIsLoading] = useState(false)

  // Estados para diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)

  // Cargar datos
  const loadData = async () => {
    if (!currentBranch || !user) return

    try {
      setLoading(true)
      const allRegisters = await getCashRegisters(tenantId, currentBranch.id)
      setRegisters(allRegisters)

      const openRegs = await getOpenCashRegisters(tenantId, currentBranch.id)
      setOpenRegisters(openRegs)

      // Si hay cajas abiertas y no hay una seleccionada, seleccionar la primera
      if (openRegs.length > 0 && !selectedRegister) {
        setSelectedRegister(openRegs[0])

        // Cargar el resumen de la caja seleccionada
        const summary = await getCashRegisterSummary(tenantId, currentBranch.id, openRegs[0].id)
        setRegisterSummary(summary)

        // Cargar el último arqueo
        const audit = await getLastCashAudit(tenantId, currentBranch.id, openRegs[0].id)
        setLastAudit(audit)
      } else if (selectedRegister) {
        // Verificar si la caja seleccionada sigue abierta
        const stillOpen = openRegs.some((reg) => reg.id === selectedRegister.id)

        // Actualizar la información de la caja seleccionada
        const updatedRegister = allRegisters.find((r) => r.id === selectedRegister.id)
        if (updatedRegister) {
          setSelectedRegister(updatedRegister)

          // Cargar el resumen actualizado
          const summary = await getCashRegisterSummary(tenantId, currentBranch.id, updatedRegister.id)
          setRegisterSummary(summary)

          // Cargar el último arqueo
          const audit = await getLastCashAudit(tenantId, currentBranch.id, updatedRegister.id)
          setLastAudit(audit)

          // Si la caja ya no está abierta y estamos en la pestaña "open", cambiar a "detail"
          if (!stillOpen && activeTab === "open") {
            setActiveTab("detail")
          }
        } else {
          // Si la caja ya no existe, deseleccionarla
          setSelectedRegister(null)
          setLastAudit(null)
        }
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch && user) {
      loadData()
    }
  }, [tenantId, currentBranch, user])

  // Manejar la selección de una caja
  const handleSelectRegister = async (register: CashRegister) => {
    setSelectedRegister(register)
    setActiveTab("detail") // Cambiar a la pestaña de detalle al seleccionar una caja

    if (currentBranch) {
      try {
        const summary = await getCashRegisterSummary(tenantId, currentBranch.id, register.id)
        setRegisterSummary(summary)

        // Cargar el último arqueo
        const audit = await getLastCashAudit(tenantId, currentBranch.id, register.id)
        setLastAudit(audit)
      } catch (error) {
        console.error("Error al cargar resumen:", error)
      }
    }
  }

  // Manejar la creación de una nueva caja
  const handleRegisterCreated = (register: CashRegister) => {
    setCreateDialogOpen(false)
    loadData()
    setSelectedRegister(register)
    setActiveTab("detail") // Cambiar a la pestaña de detalle al crear una caja
  }

  // Manejar el registro de un movimiento
  const handleMovementCreated = () => {
    setMovementDialogOpen(false)
    loadData()
  }

  // Manejar el cierre de caja
  const handleRegisterClosed = () => {
    setCloseDialogOpen(false)
    loadData()
    // No deseleccionamos la caja para poder seguir viendo sus detalles
  }

  // Manejar la realización de un arqueo
  const handleAuditCompleted = () => {
    setAuditDialogOpen(false)
    loadData()
  }

  // Manejar la solicitud de arqueo desde el formulario de cierre
  const handleRequestAudit = () => {
    // Cerrar el diálogo de cierre y abrir el de arqueo
    setCloseDialogOpen(false)
    // Pequeño retraso para evitar problemas de renderizado con múltiples diálogos
    setTimeout(() => {
      setAuditDialogOpen(true)
    }, 300)
  }

  // Asegúrate de que la función closeCashRegister actualice el estado local
  const handleCloseCashRegister = async (registerId: string, closeData: any) => {
    try {
      setIsLoading(true)
      await closeCashRegister(tenantId, currentBranch?.id || "", registerId, closeData)

      // Actualizar el estado local para reflejar que la caja está cerrada
      setOpenRegisters((prev) => prev.filter((reg) => reg.id !== registerId))

      toast({
        title: "Caja cerrada",
        description: "La caja ha sido cerrada correctamente",
      })
    } catch (error) {
      console.error("Error al cerrar la caja:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar la caja",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener el color y texto según el estado de la caja
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      open: { color: "bg-green-100 text-green-800", text: "Abierta" },
      closed: { color: "bg-gray-100 text-gray-800", text: "Cerrada" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pendiente" },
    }

    return statusMap[status] || { color: "bg-gray-100 text-gray-800", text: status }
  }

  // Navegar a la página de movimientos
  const navigateToMovements = (registerId: string) => {
    // Usar ruta relativa
    router.push(`/admin/cash-register/movements/${registerId}`)
  }

  // Navegar a la página de arqueos
  const navigateToAudits = (registerId: string) => {
    // Usar ruta relativa
    router.push(`/admin/cash-register/audits/${registerId}`)
  }

  // Obtener información del último arqueo
  const getLastAuditInfo = () => {
    if (!lastAudit) {
      return {
        text: "Sin arqueos",
        icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
        color: "text-gray-500",
      }
    }

    const timeSinceAudit = new Date().getTime() - new Date(lastAudit.performedAt).getTime()
    const hoursSinceAudit = Math.floor(timeSinceAudit / (1000 * 60 * 60))

    if (lastAudit.status === "balanced") {
      return {
        text: `Último arqueo: ${formatDateTime(lastAudit.performedAt)} (${hoursSinceAudit}h)`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        color: "text-green-600",
      }
    } else if (lastAudit.status === "surplus") {
      return {
        text: `Último arqueo: ${formatDateTime(lastAudit.performedAt)} (${hoursSinceAudit}h) - Sobrante: ${formatCurrency(lastAudit.difference)}`,
        icon: <AlertCircle className="h-4 w-4 text-blue-600" />,
        color: "text-blue-600",
      }
    } else {
      return {
        text: `Último arqueo: ${formatDateTime(lastAudit.performedAt)} (${hoursSinceAudit}h) - Faltante: ${formatCurrency(Math.abs(lastAudit.difference))}`,
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        color: "text-red-600",
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestor de Caja</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {currentBranch && (
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Caja
            </Button>
          )}
        </div>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="open">Cajas Abiertas</TabsTrigger>
              <TabsTrigger value="all">Todas las Cajas</TabsTrigger>
              {selectedRegister && <TabsTrigger value="detail">Detalle de Caja</TabsTrigger>}
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-4">Cajas Abiertas</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : openRegisters.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No hay cajas abiertas</AlertTitle>
                    <AlertDescription>
                      Para comenzar a registrar movimientos, primero debe abrir una caja.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openRegisters.map((register) => {
                      const statusBadge = getStatusBadge(register.status)
                      return (
                        <Card
                          key={register.id}
                          className={`cursor-pointer hover:border-primary transition-colors ${
                            selectedRegister?.id === register.id ? "border-primary" : ""
                          }`}
                          onClick={() => handleSelectRegister(register)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{register.name}</CardTitle>
                              <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
                            </div>
                            <CardDescription>Abierta el {formatDateTime(register.openedAt)}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Balance Inicial:</span>
                                <span className="font-medium">{formatCurrency(register.initialBalance)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Balance Actual:</span>
                                <span className="font-bold text-lg">{formatCurrency(register.currentBalance)}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <div className="flex flex-wrap justify-between w-full gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectRegister(register)
                                  setMovementDialogOpen(true)
                                }}
                              >
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Movimiento
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectRegister(register)
                                  setAuditDialogOpen(true)
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                Arqueo
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelectRegister(register)
                                  setCloseDialogOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cerrar
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-4">Todas las Cajas</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : registers.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No hay cajas registradas</AlertTitle>
                    <AlertDescription>
                      Para comenzar a utilizar el gestor de caja, primero debe crear una caja.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {registers.map((register) => {
                      const statusBadge = getStatusBadge(register.status)
                      return (
                        <Card
                          key={register.id}
                          className={`cursor-pointer hover:border-primary transition-colors ${
                            selectedRegister?.id === register.id ? "border-primary" : ""
                          }`}
                          onClick={() => handleSelectRegister(register)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{register.name}</CardTitle>
                              <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
                            </div>
                            <CardDescription>
                              {register.status === "open"
                                ? `Abierta el ${formatDateTime(register.openedAt)}`
                                : register.status === "closed"
                                  ? `Cerrada el ${formatDateTime(register.closedAt || "")}`
                                  : `Creada el ${formatDateTime(register.createdAt)}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Balance Inicial:</span>
                                <span className="font-medium">{formatCurrency(register.initialBalance)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                  {register.status === "closed" ? "Balance Final:" : "Balance Actual:"}
                                </span>
                                <span className="font-bold text-lg">{formatCurrency(register.currentBalance)}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <div className="flex flex-wrap justify-end w-full gap-2">
                              {register.status === "open" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSelectRegister(register)
                                      setMovementDialogOpen(true)
                                    }}
                                  >
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    Movimiento
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSelectRegister(register)
                                      setAuditDialogOpen(true)
                                    }}
                                  >
                                    <ClipboardCheck className="h-4 w-4 mr-2" />
                                    Arqueo
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToAudits(register.id)
                                }}
                              >
                                <ClipboardCheck className="h-4 w-4 mr-2" />
                                Ver Arqueos
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigateToMovements(register.id)
                                }}
                              >
                                <History className="h-4 w-4 mr-2" />
                                Ver Movimientos
                              </Button>
                              {register.status === "open" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelectRegister(register)
                                    setCloseDialogOpen(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cerrar
                                </Button>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {selectedRegister && (
              <TabsContent value="detail" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    Detalle de Caja: {selectedRegister.name}{" "}
                    <Badge className={getStatusBadge(selectedRegister.status).color}>
                      {getStatusBadge(selectedRegister.status).text}
                    </Badge>
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {selectedRegister.status === "open" ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setMovementDialogOpen(true)}>
                          <ArrowUpDown className="h-4 w-4 mr-2" />
                          Nuevo Movimiento
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAuditDialogOpen(true)}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Realizar Arqueo
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateToAudits(selectedRegister.id)}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Ver Arqueos
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateToMovements(selectedRegister.id)}>
                          <History className="h-4 w-4 mr-2" />
                          Ver Movimientos
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCloseDialogOpen(true)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cerrar Caja
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => navigateToAudits(selectedRegister.id)}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Ver Arqueos
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateToMovements(selectedRegister.id)}>
                          <History className="h-4 w-4 mr-2" />
                          Ver Movimientos
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Información del último arqueo */}
                {selectedRegister.status === "open" && (
                  <Card className="mb-4">
                    <CardHeader className="py-3">
                      <div className="flex items-center">
                        {getLastAuditInfo().icon}
                        <CardTitle className={`text-base ml-2 ${getLastAuditInfo().color}`}>
                          {getLastAuditInfo().text}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <div className="flex justify-between w-full">
                        <Button variant="outline" size="sm" onClick={() => navigateToAudits(selectedRegister.id)}>
                          Ver historial de arqueos
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setAuditDialogOpen(true)}>
                          Realizar nuevo arqueo
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )}

                <CashRegisterSummaryComponent
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  registerId={selectedRegister.id}
                />
              </TabsContent>
            )}
          </Tabs>

          {/* Diálogo para crear nueva caja */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Caja</DialogTitle>
                <DialogDescription>Complete la información para abrir una nueva caja.</DialogDescription>
              </DialogHeader>
              {user && (
                <CashRegisterForm
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  userId={user.uid}
                  onSuccess={handleRegisterCreated}
                  onCancel={() => setCreateDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Diálogo para registrar movimiento */}
          <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Movimiento</DialogTitle>
                <DialogDescription>
                  Complete la información para registrar un nuevo movimiento en la caja.
                </DialogDescription>
              </DialogHeader>
              {user && selectedRegister && (
                <CashMovementForm
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  userId={user.uid}
                  registerId={selectedRegister.id}
                  onSuccess={handleMovementCreated}
                  onCancel={() => setMovementDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Diálogo para cerrar caja */}
          <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cerrar Caja</DialogTitle>
                <DialogDescription>Complete la información para cerrar la caja seleccionada.</DialogDescription>
              </DialogHeader>
              {user && selectedRegister && registerSummary && (
                <CashRegisterCloseForm
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  userId={user.uid}
                  register={selectedRegister}
                  summary={registerSummary}
                  onSuccess={handleRegisterClosed}
                  onCancel={() => setCloseDialogOpen(false)}
                  onRequestAudit={handleRequestAudit}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Diálogo para realizar arqueo de caja */}
          {user && selectedRegister && registerSummary && (
            <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
              <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Arqueo de Caja: {selectedRegister.name}</DialogTitle>
                  <DialogDescription>
                    Verifique el efectivo físico en la caja y registre el resultado.
                  </DialogDescription>
                </DialogHeader>
                <CashAuditForm
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  userId={user.uid}
                  register={selectedRegister}
                  onSuccess={() => {
                    setAuditDialogOpen(false)
                    loadData()
                  }}
                  onCancel={() => setAuditDialogOpen(false)}
                  expectedCash={registerSummary.paymentMethodTotals.cash || 0}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  )
}
