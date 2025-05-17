"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getPendingVerificationMovements } from "@/lib/services/cash-register-service"
import { useUser } from "@/lib/hooks/use-user"
import { PaymentVerificationForm } from "@/components/payment-verification-form"
import { PaymentVerificationBadge } from "@/components/payment-verification-badge"
import { useBranch } from "@/lib/context/branch-context"
import { ArrowDownCircle, ArrowUpCircle, CreditCard, RefreshCw, Search } from "lucide-react"
import type { CashMovement } from "@/lib/types/cash-register"
import type { JSX } from "react"

interface PendingPaymentsPageProps {
  params: {
    tenantId: string
  }
}

export default function PendingPaymentsPage({ params }: PendingPaymentsPageProps) {
  const { tenantId } = params
  const { currentBranch } = useBranch()
  const { user } = useUser()
  const [movements, setMovements] = useState<CashMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "transfer" | "card">("all")

  const loadMovements = async () => {
    if (!currentBranch) return

    try {
      setLoading(true)
      const pendingMovements = await getPendingVerificationMovements(tenantId, currentBranch.id)
      setMovements(pendingMovements || [])
    } catch (error) {
      console.error("Error al cargar pagos pendientes:", error)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentBranch) {
      loadMovements()
    }
  }, [tenantId, currentBranch])

  const handleVerificationSuccess = (updatedMovement: CashMovement) => {
    setVerificationDialogOpen(false)
    setSelectedMovement(null)

    // Actualizar la lista de movimientos
    setMovements((prevMovements) => prevMovements.filter((m) => m.id !== updatedMovement.id))
  }

  // Filtrar movimientos por término de búsqueda y tipo
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      searchTerm === "" ||
      movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.transactionId && movement.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "transfer" && movement.paymentMethod === "transfer") ||
      (activeTab === "card" && movement.paymentMethod === "card")

    return matchesSearch && matchesTab
  })

  // Función para obtener el color y texto según el tipo de movimiento
  const getMovementTypeInfo = (type: string) => {
    const typeMap: Record<string, { color: string; text: string; icon: JSX.Element }> = {
      income: {
        color: "bg-green-100 text-green-800",
        text: "Ingreso",
        icon: <ArrowUpCircle className="h-4 w-4 text-green-600" />,
      },
      expense: {
        color: "bg-red-100 text-red-800",
        text: "Gasto",
        icon: <ArrowDownCircle className="h-4 w-4 text-red-600" />,
      },
      sale: {
        color: "bg-blue-100 text-blue-800",
        text: "Venta",
        icon: <ArrowUpCircle className="h-4 w-4 text-blue-600" />,
      },
      refund: {
        color: "bg-orange-100 text-orange-800",
        text: "Reembolso",
        icon: <ArrowDownCircle className="h-4 w-4 text-orange-600" />,
      },
      withdrawal: {
        color: "bg-purple-100 text-purple-800",
        text: "Retiro",
        icon: <ArrowDownCircle className="h-4 w-4 text-purple-600" />,
      },
      deposit: {
        color: "bg-indigo-100 text-indigo-800",
        text: "Depósito",
        icon: <ArrowUpCircle className="h-4 w-4 text-indigo-600" />,
      },
      adjustment: {
        color: "bg-gray-100 text-gray-800",
        text: "Ajuste",
        icon: <ArrowUpCircle className="h-4 w-4 text-gray-600" />,
      },
    }

    return typeMap[type] || { color: "bg-gray-100 text-gray-800", text: type, icon: null }
  }

  // Función para obtener el texto del método de pago
  const getPaymentMethodText = (method: string) => {
    const methodMap: Record<string, { text: string; icon: JSX.Element }> = {
      cash: { text: "Efectivo", icon: <ArrowUpCircle className="h-4 w-4" /> },
      card: { text: "Tarjeta", icon: <CreditCard className="h-4 w-4" /> },
      transfer: { text: "Transferencia", icon: <ArrowUpCircle className="h-4 w-4" /> },
      app: { text: "App de Pago", icon: <CreditCard className="h-4 w-4" /> },
      other: { text: "Otro", icon: <ArrowUpCircle className="h-4 w-4" /> },
    }

    return methodMap[method] || { text: method, icon: <ArrowUpCircle className="h-4 w-4" /> }
  }

  if (!currentBranch) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Pagos Pendientes</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Seleccione una sucursal para ver los pagos pendientes.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Pagos Pendientes</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar pagos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={loadMovements} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="transfer">Transferencias</TabsTrigger>
          <TabsTrigger value="card">Tarjetas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderContent()}
        </TabsContent>
        <TabsContent value="transfer" className="mt-0">
          {renderContent()}
        </TabsContent>
        <TabsContent value="card" className="mt-0">
          {renderContent()}
        </TabsContent>
      </Tabs>

      {/* Diálogo de verificación */}
      {user && selectedMovement && (
        <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verificar Pago</DialogTitle>
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
    </div>
  )

  function renderContent() {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )
    }

    if (filteredMovements.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No hay pagos pendientes
              <br />
              Todos los pagos con tarjeta y transferencias han sido verificados.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {filteredMovements.map((movement) => {
          const typeInfo = getMovementTypeInfo(movement.type)
          const paymentMethod = getPaymentMethodText(movement.paymentMethod)
          const isNegative = ["expense", "refund", "withdrawal"].includes(movement.type)

          return (
            <Card key={movement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {typeInfo.icon}
                    <CardTitle className="text-base">{movement.description}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentVerificationBadge status={movement.verificationStatus} />
                  </div>
                </div>
                <CardDescription>
                  {formatDateTime(movement.createdAt)} •
                  <span className="flex items-center gap-1 inline-flex ml-1">
                    {paymentMethod.icon}
                    {paymentMethod.text}
                  </span>
                  {movement.reference && ` • Ref: ${movement.reference}`}
                  {movement.transactionId && ` • Trans: ${movement.transactionId}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    {movement.orderNumber && (
                      <span className="text-sm text-gray-500">Pedido #{movement.orderNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${isNegative ? "text-red-600" : "text-green-600"}`}>
                      {isNegative ? "-" : "+"}
                      {formatCurrency(movement.amount)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMovement(movement)
                        setVerificationDialogOpen(true)
                      }}
                    >
                      Verificar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }
}
