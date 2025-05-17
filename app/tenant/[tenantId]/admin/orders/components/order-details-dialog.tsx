"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Order, OrderStatus } from "@/lib/types/order"
import { formatCurrency } from "@/lib/utils"
import { updateOrderStatus, deleteOrder } from "@/lib/services/order-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, DollarSign, AlertCircle, Printer, Utensils, CreditCard } from "lucide-react"
import { PrintTicketDialog } from "@/components/print-ticket-dialog"
import { PrintCommandDialog } from "@/components/print-command-dialog"
import { usePrintTicket } from "@/lib/hooks/use-print-ticket"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUser } from "@/lib/hooks/use-user"

// Añadir los imports necesarios
import { getOpenCashRegisters, registerSale } from "@/lib/services/cash-register-service"
import type { CashRegister, CashMovement } from "@/lib/types/cash-register"
import { PaymentVerificationForm } from "@/components/payment-verification-form"
import { PaymentVerificationBadge } from "@/components/payment-verification-badge"
import { get, ref } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
  onStatusChange: () => void
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  tenantId,
  branchId,
  onStatusChange,
}: OrderDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { isPrintDialogOpen, setIsPrintDialogOpen, isCommandDialogOpen, setIsCommandDialogOpen, restaurantInfo } =
    usePrintTicket(tenantId, branchId)
  const { user } = useUser()

  // Añadir estados para la caja
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<string>("")
  const [showCashRegisterSection, setShowCashRegisterSection] = useState(false)
  const [registeringInCash, setRegisteringInCash] = useState(false)

  // Estados para verificación de pago
  const [paymentMovement, setPaymentMovement] = useState<CashMovement | null>(null)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)

  // Añadir función para cargar cajas
  const loadCashRegisters = async () => {
    try {
      if (tenantId && branchId) {
        const openRegisters = await getOpenCashRegisters(tenantId, branchId)
        setCashRegisters(openRegisters)

        // Si hay una caja abierta, seleccionarla por defecto
        if (openRegisters.length > 0) {
          setSelectedCashRegisterId(openRegisters[0].id)
        }
      }
    } catch (error) {
      console.error("Error al cargar cajas:", error)
    }
  }

  // Función para buscar el movimiento de pago asociado a este pedido
  const loadPaymentMovement = async () => {
    if (!order || !order.id) return null

    try {
      // Obtener todos los movimientos de caja
      const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
      const snapshot = await get(movementsRef)

      if (!snapshot.exists()) return null

      const movementsData = snapshot.val()
      const allMovements = Object.entries(movementsData).map(([id, data]) => ({
        id,
        ...(data as any),
      })) as CashMovement[]

      // Buscar el movimiento asociado a este pedido
      const orderMovement = allMovements.find(
        (m) => m.orderId === order.id && (m.paymentMethod === "transfer" || m.paymentMethod === "card"),
      )

      setPaymentMovement(orderMovement || null)
      return orderMovement
    } catch (error) {
      console.error("Error al buscar movimiento de pago:", error)
      return null
    }
  }

  // Modificar useEffect para cargar cajas y movimiento de pago
  useEffect(() => {
    if (open && order) {
      loadCashRegisters()
      loadPaymentMovement()
    }
  }, [open, order, tenantId, branchId])

  // Añadir función para registrar en caja
  const handleRegisterInCash = async () => {
    if (!order || !selectedCashRegisterId || !user) return

    try {
      setRegisteringInCash(true)
      await registerSale(
        tenantId,
        branchId,
        user.uid,
        selectedCashRegisterId,
        order.id,
        order.orderNumber,
        order.total,
        order.paymentMethod || "cash",
      )

      toast({
        title: "Venta registrada",
        description: `La venta se ha registrado correctamente en la caja`,
        variant: "default",
      })

      setShowCashRegisterSection(false)

      // Si el pago es con transferencia o tarjeta, cargar el movimiento para verificación
      if (order.paymentMethod === "transfer" || order.paymentMethod === "card") {
        const movement = await loadPaymentMovement()
        if (movement) {
          setPaymentMovement(movement)
        }
      }
    } catch (error) {
      console.error("Error al registrar venta en caja:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la venta en la caja",
        variant: "destructive",
      })
    } finally {
      setRegisteringInCash(false)
    }
  }

  // Función para manejar la verificación exitosa
  const handleVerificationSuccess = (updatedMovement: CashMovement) => {
    setVerificationDialogOpen(false)
    setPaymentMovement(updatedMovement)

    toast({
      title: "Pago verificado",
      description: "El estado del pago ha sido actualizado correctamente",
      variant: "default",
    })
  }

  const handleStatusChange = async (status: OrderStatus) => {
    try {
      setLoading(true)
      await updateOrderStatus(tenantId, branchId, order.id, status)
      onStatusChange()
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    try {
      setLoading(true)
      await deleteOrder(tenantId, branchId, order.id)
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onStatusChange()
    } catch (error) {
      console.error("Error al eliminar pedido:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
      preparing: { label: "En preparación", className: "bg-blue-100 text-blue-800" },
      ready: { label: "Listo", className: "bg-green-100 text-green-800" },
      delivered: { label: "Entregado", className: "bg-gray-100 text-gray-800" },
      cancelled: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getOrderTypeBadge = (type: string) => {
    const typeConfig = {
      local: { label: "Local", className: "bg-purple-100 text-purple-800" },
      takeaway: { label: "Para llevar", className: "bg-indigo-100 text-indigo-800" },
      table: { label: "Mesa", className: "bg-blue-100 text-blue-800" },
      delivery: { label: "Delivery", className: "bg-green-100 text-green-800" },
    }

    const config = typeConfig[type as keyof typeof typeConfig]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  // Verificar si el IVA está activado en el pedido
  const isTaxEnabled = order.taxEnabled !== undefined ? order.taxEnabled : true

  // Verificar si es un pago electrónico (transferencia o tarjeta)
  const isElectronicPayment = order.paymentMethod === "transfer" || order.paymentMethod === "card"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Pedido {order.orderNumber}</span>
              <div className="flex items-center gap-2">
                {getOrderTypeBadge(order.type)}
                {getStatusBadge(order.status)}
              </div>
            </DialogTitle>
            <DialogDescription>Creado el {formatDate(order.createdAt)}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h3 className="font-medium mb-2">Información del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Nombre:</span> {order.customerName || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span> {order.customerPhone || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.customerEmail || "No especificado"}
                </p>

                {order.type === "table" && (
                  <p>
                    <span className="font-medium">Mesa:</span> {order.tableNumber}
                  </p>
                )}

                {order.type === "delivery" && order.deliveryAddress && (
                  <div>
                    <p className="font-medium">Dirección de entrega:</p>
                    <p>
                      {order.deliveryAddress.street} {order.deliveryAddress.number}
                    </p>
                    <p>
                      {order.deliveryAddress.city} {order.deliveryAddress.zipCode}
                    </p>
                    {order.deliveryAddress.notes && <p>Notas: {order.deliveryAddress.notes}</p>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Información del Pago</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Método de pago:</span> {order.paymentMethod || "No especificado"}
                </p>
                <p>
                  <span className="font-medium">Estado del pago:</span>{" "}
                  <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
                    {order.paymentStatus === "paid"
                      ? "Pagado"
                      : order.paymentStatus === "failed"
                        ? "Fallido"
                        : "Pendiente"}
                  </Badge>
                </p>

                {/* Mostrar estado de verificación para pagos electrónicos */}
                {isElectronicPayment && (
                  <div className="mt-2">
                    <span className="font-medium">Verificación:</span>{" "}
                    {paymentMovement ? (
                      <div className="flex items-center gap-2 mt-1">
                        <PaymentVerificationBadge status={paymentMovement.verificationStatus || "pending"} />
                        {user && (
                          <Button variant="outline" size="sm" onClick={() => setVerificationDialogOpen(true)}>
                            Verificar
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No registrado en caja</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="py-4">
            <h3 className="font-medium mb-4">Artículos del Pedido</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                    {item.extras && item.extras.length > 0 && (
                      <div className="text-sm text-gray-500 ml-4">
                        <p className="font-medium">Extras:</p>
                        <ul className="list-disc list-inside">
                          {item.extras.map((extra, i) => (
                            <li key={i}>
                              {extra.name} ({formatCurrency(extra.price)})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.notes && <p className="text-sm text-gray-500 mt-1">Nota: {item.notes}</p>}
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="py-4">
            <div className="flex justify-between items-center">
              <span>{isTaxEnabled && order.taxIncluded ? "Subtotal (IVA incluido)" : "Subtotal"}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            {/* Solo mostrar el IVA si está activado Y no está incluido en los precios */}
            {isTaxEnabled && !order.taxIncluded && order.tax > 0 && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>Impuestos</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}

            {order.tip > 0 && (
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>Propina</span>
                <span>{formatCurrency(order.tip)}</span>
              </div>
            )}

            {order.coupon && order.coupon.discount > 0 && (
              <div className="flex justify-between items-center mt-2 text-sm text-green-600">
                <span>Descuento</span>
                <span>-{formatCurrency(order.coupon.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-4 font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-between gap-2 mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsPrintDialogOpen(true)} title="Imprimir Ticket">
                <Printer className="h-4 w-4 mr-2" />
                Ticket
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsCommandDialogOpen(true)} title="Imprimir Comanda">
                <Utensils className="h-4 w-4 mr-2" />
                Comanda
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("cancelled")}
                disabled={loading || order.status === "cancelled"}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const nextStatus: Record<OrderStatus, OrderStatus> = {
                    pending: "preparing",
                    preparing: "ready",
                    ready: "delivered",
                    delivered: "delivered",
                    cancelled: "cancelled",
                  }
                  handleStatusChange(nextStatus[order.status])
                }}
                disabled={loading || order.status === "delivered" || order.status === "cancelled"}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {order.status === "pending" && "Iniciar Preparación"}
                {order.status === "preparing" && "Marcar como Listo"}
                {order.status === "ready" && "Marcar como Entregado"}
                {(order.status === "delivered" || order.status === "cancelled") && "Completado"}
              </Button>
            </div>
          </div>

          {/* Sección para registrar en caja */}
          {order && order.status !== "cancelled" && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Registrar en Caja</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCashRegisterSection(!showCashRegisterSection)
                    if (!showCashRegisterSection) {
                      loadCashRegisters()
                    }
                  }}
                >
                  {showCashRegisterSection ? "Ocultar" : "Mostrar"}
                </Button>
              </div>

              {showCashRegisterSection && (
                <div className="mt-4 space-y-4">
                  {cashRegisters.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No hay cajas abiertas</AlertTitle>
                      <AlertDescription>Para registrar esta venta, primero debe abrir una caja.</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="cashRegister">Seleccionar Caja</Label>
                        <Select value={selectedCashRegisterId} onValueChange={setSelectedCashRegisterId}>
                          <SelectTrigger id="cashRegister">
                            <SelectValue placeholder="Seleccionar caja" />
                          </SelectTrigger>
                          <SelectContent>
                            {cashRegisters.map((register) => (
                              <SelectItem key={register.id} value={register.id}>
                                {register.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleRegisterInCash}
                        disabled={registeringInCash || !selectedCashRegisterId}
                        className="w-full"
                      >
                        {registeringInCash ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Registrar Venta en Caja
                          </>
                        )}
                      </Button>

                      {/* Botón para verificar pago electrónico */}
                      {isElectronicPayment && paymentMovement && (
                        <Button
                          variant="outline"
                          onClick={() => setVerificationDialogOpen(true)}
                          disabled={registeringInCash}
                          className="w-full"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Verificar Pago Electrónico
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pedido {order.orderNumber} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PrintTicketDialog
        order={order}
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        restaurantName={restaurantInfo.name}
        restaurantAddress={restaurantInfo.address}
        restaurantPhone={restaurantInfo.phone}
        restaurantLogo={restaurantInfo.logo}
      />

      <PrintCommandDialog
        order={order}
        open={isCommandDialogOpen}
        onOpenChange={setIsCommandDialogOpen}
        restaurantName={restaurantInfo.name}
      />

      {/* Diálogo para verificar pago */}
      {user && paymentMovement && (
        <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verificar Pago</DialogTitle>
              <DialogDescription>Confirme si el pago ha sido recibido correctamente.</DialogDescription>
            </DialogHeader>
            <PaymentVerificationForm
              tenantId={tenantId}
              branchId={branchId}
              userId={user.uid}
              movement={paymentMovement}
              onSuccess={handleVerificationSuccess}
              onCancel={() => setVerificationDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
