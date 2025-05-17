"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useBranch } from "@/lib/context/branch-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { getCashRegister, getCashMovements } from "@/lib/services/cash-register-service"
import { ref, get } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { CashRegister, CashMovement } from "@/lib/types/cash-register"
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle, ChevronDown, RefreshCw, AlertTriangle } from "lucide-react"
import type { JSX } from "react"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

export default function CashRegisterMovementsPage({
  params,
}: {
  params: { tenantId: string; registerId: string }
}) {
  const { tenantId, registerId } = params
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { user } = useAuth()
  const [register, setRegister] = useState<CashRegister | null>(null)
  const [movements, setMovements] = useState<(CashMovement & { isCancelled?: boolean })[]>([])
  const [displayedMovements, setDisplayedMovements] = useState<(CashMovement & { isCancelled?: boolean })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Cargar datos
  const loadData = async () => {
    if (!currentBranch || !user) return

    try {
      setLoading(true)

      // Cargar información de la caja
      const registerData = await getCashRegister(tenantId, currentBranch.id, registerId)
      if (!registerData) {
        // Si no se encuentra la caja, redirigir a la página principal
        router.push(`/admin/cash-register`)
        return
      }
      setRegister(registerData)

      // Cargar todos los movimientos
      const movementsData = await getCashMovements(tenantId, currentBranch.id, registerId)

      // Obtener todos los pedidos para verificar su estado
      const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${currentBranch.id}/orders`)
      const ordersSnapshot = await get(ordersRef)
      const orders = ordersSnapshot.exists() ? ordersSnapshot.val() : {}

      // Marcar los movimientos de pedidos cancelados
      const enhancedMovements = movementsData.map((movement) => {
        if (movement.orderId && movement.type === "sale") {
          const order = orders[movement.orderId]
          if (order && order.status === "cancelled") {
            return { ...movement, isCancelled: true }
          }
        }
        return { ...movement, isCancelled: false }
      })

      setMovements(enhancedMovements)

      // Mostrar solo los primeros ITEMS_PER_PAGE movimientos
      setDisplayedMovements(enhancedMovements.slice(0, ITEMS_PER_PAGE))

      // Verificar si hay más movimientos para cargar
      setHasMore(enhancedMovements.length > ITEMS_PER_PAGE)

      // Resetear la página
      setPage(1)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar más movimientos
  const loadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    const start = (nextPage - 1) * ITEMS_PER_PAGE
    const end = nextPage * ITEMS_PER_PAGE

    // Añadir los siguientes movimientos a los ya mostrados
    const nextMovements = movements.slice(start, end)
    setDisplayedMovements([...displayedMovements, ...nextMovements])

    // Actualizar la página y verificar si hay más movimientos
    setPage(nextPage)
    setHasMore(end < movements.length)
    setLoadingMore(false)
  }

  useEffect(() => {
    if (currentBranch && user) {
      loadData()
    }
  }, [tenantId, registerId, currentBranch, user])

  // Función para obtener el color y texto según el tipo de movimiento
  const getMovementTypeInfo = (type: string, isCancelled = false) => {
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
        color: isCancelled ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800",
        text: isCancelled ? "Venta Cancelada" : "Venta",
        icon: isCancelled ? (
          <AlertTriangle className="h-4 w-4 text-gray-600" />
        ) : (
          <ArrowUpCircle className="h-4 w-4 text-blue-600" />
        ),
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
    const methodMap: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      app: "App de Pago",
      other: "Otro",
    }

    return methodMap[method] || method
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!register) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudo cargar la información de la caja.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/admin/cash-register">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Movimientos de Caja: {register.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{register.name}</CardTitle>
              <CardDescription>
                {register.status === "open"
                  ? `Abierta el ${formatDateTime(register.openedAt)}`
                  : register.status === "closed"
                    ? `Cerrada el ${formatDateTime(register.closedAt || "")}`
                    : `Creada el ${formatDateTime(register.createdAt)}`}
              </CardDescription>
            </div>
            <Badge className={getStatusBadge(register.status).color}>{getStatusBadge(register.status).text}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Balance Inicial</p>
              <p className="text-lg font-medium">{formatCurrency(register.initialBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {register.status === "closed" ? "Balance Final" : "Balance Actual"}
              </p>
              <p className="text-lg font-bold">{formatCurrency(register.currentBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Movimientos ({movements.length})</h2>
        </div>

        {movements.length === 0 ? (
          <Alert>
            <AlertTitle>No hay movimientos</AlertTitle>
            <AlertDescription>Esta caja no tiene movimientos registrados.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-4">
              {displayedMovements.map((movement) => {
                const typeInfo = getMovementTypeInfo(movement.type, movement.isCancelled)
                const isNegative = ["expense", "refund", "withdrawal"].includes(movement.type)
                const isCancelled = movement.isCancelled

                return (
                  <Card key={movement.id} className={isCancelled ? "border-gray-300 bg-gray-50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {typeInfo.icon}
                          <CardTitle className={`text-base ${isCancelled ? "line-through text-gray-500" : ""}`}>
                            {movement.description}
                          </CardTitle>
                        </div>
                        <Badge className={typeInfo.color}>{typeInfo.text}</Badge>
                      </div>
                      <CardDescription>
                        {formatDateTime(movement.createdAt)} • {getPaymentMethodText(movement.paymentMethod)}
                        {movement.reference && ` • Ref: ${movement.reference}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          {movement.orderNumber && (
                            <span className={`text-sm ${isCancelled ? "text-gray-500" : "text-gray-500"}`}>
                              Pedido #{movement.orderNumber}
                              {isCancelled && " (Cancelado)"}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            isCancelled ? "text-gray-500" : isNegative ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isNegative ? "-" : "+"}
                          {formatCurrency(movement.amount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full max-w-xs">
                  {loadingMore ? (
                    "Cargando..."
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Cargar más movimientos
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
