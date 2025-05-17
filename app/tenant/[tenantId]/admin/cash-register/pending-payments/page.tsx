"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/context/auth-context"
import { useBranch } from "@/lib/context/branch-context"
import { NoBranchSelectedAlert } from "@/components/no-branch-selected-alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getPendingVerificationMovements } from "@/lib/services/cash-register-service"
import type { CashMovement } from "@/lib/types/cash-register"
import { PaymentVerificationForm } from "@/components/payment-verification-form"
import { PaymentVerificationBadge } from "@/components/payment-verification-badge"
import { CheckCircle2, RefreshCw, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PendingPaymentsPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [pendingMovements, setPendingMovements] = useState<CashMovement[]>([])
  const [filteredMovements, setFilteredMovements] = useState<CashMovement[]>([])
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")

  // Cargar datos
  const loadData = async () => {
    if (!currentBranch || !user) return

    try {
      setLoading(true)
      const movements = await getPendingVerificationMovements(tenantId, currentBranch.id)
      setPendingMovements(movements)
      applyFilters(movements, searchTerm, paymentMethodFilter)
    } catch (error) {
      console.error("Error al cargar pagos pendientes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch && user) {
      loadData()
    }
  }, [tenantId, currentBranch, user])

  // Aplicar filtros
  const applyFilters = (movements: CashMovement[], search: string, paymentMethod: string) => {
    let filtered = movements

    // Filtrar por método de pago
    if (paymentMethod !== "all") {
      filtered = filtered.filter((m) => m.paymentMethod === paymentMethod)
    }

    // Filtrar por término de búsqueda
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.description.toLowerCase().includes(searchLower) ||
          m.reference?.toLowerCase().includes(searchLower) ||
          m.orderNumber?.toLowerCase().includes(searchLower) ||
          m.transactionId?.toLowerCase().includes(searchLower),
      )
    }

    setFilteredMovements(filtered)
  }

  useEffect(() => {
    applyFilters(pendingMovements, searchTerm, paymentMethodFilter)
  }, [searchTerm, paymentMethodFilter, pendingMovements])

  // Manejar la verificación de un pago
  const handleVerificationSuccess = (updatedMovement: CashMovement) => {
    setVerificationDialogOpen(false)
    loadData() // Recargar datos
  }

  // Obtener el nombre del método de pago
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "transfer":
        return "Transferencia"
      case "card":
        return "Tarjeta"
      case "cash":
        return "Efectivo"
      case "app":
        return "App de Pago"
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pagos Pendientes de Verificación</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <NoBranchSelectedAlert />

      {currentBranch && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por descripción, referencia o número de orden..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : filteredMovements.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>No hay pagos pendientes</AlertTitle>
              <AlertDescription>Todos los pagos con tarjeta y transferencias han sido verificados.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMovements.map((movement) => (
                <Card
                  key={movement.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setSelectedMovement(movement)
                    setVerificationDialogOpen(true)
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{getPaymentMethodName(movement.paymentMethod)}</CardTitle>
                      <PaymentVerificationBadge status={movement.verificationStatus || "pending"} />
                    </div>
                    <CardDescription>
                      {movement.orderNumber ? `Pedido #${movement.orderNumber}` : "Movimiento de caja"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Monto:</span>
                        <span className="font-bold text-lg">{formatCurrency(movement.amount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Fecha:</span>
                        <span className="font-medium">{formatDateTime(movement.createdAt)}</span>
                      </div>
                      {movement.reference && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Referencia:</span>
                          <span className="font-medium">{movement.reference}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full">
                      <p className="text-sm text-gray-600 truncate">{movement.description}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Diálogo para verificar pago */}
          {user && selectedMovement && (
            <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Verificar Pago</DialogTitle>
                  <DialogDescription>Confirme si el pago ha sido recibido correctamente.</DialogDescription>
                </DialogHeader>
                <PaymentVerificationForm
                  tenantId={tenantId}
                  branchId={currentBranch.id}
                  userId={user.uid}
                  movement={selectedMovement}
                  onSuccess={handleVerificationSuccess}
                  onCancel={() => setVerificationDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  )
}
