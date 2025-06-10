"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useCheckout } from "../context/checkout-context"
import { useCart } from "../context/cart-context"
import { ServiceSelectionStep } from "./checkout/service-selection-step"
import { CustomerInfoStep } from "./checkout/customer-info-step"
import { PaymentMethodStep } from "./checkout/payment-method-step"
import { OrderSummaryStep } from "./checkout/order-summary-step"
import { formatCurrency } from "@/lib/utils"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  branchId: string
}

const STEPS = [
  { id: 1, title: "Tipo de Servicio" },
  { id: 2, title: "Información Personal" },
  { id: 3, title: "Método de Pago" },
  { id: 4, title: "Confirmar Pedido" },
]

export function CheckoutModal({ open, onOpenChange, tenantId, branchId }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const { checkoutState, resetCheckout, availableServices, availablePaymentMethods } = useCheckout()
  const { items, total, clearCart } = useCart()

  const handleClose = () => {
    resetCheckout()
    setCurrentStep(1)
    onOpenChange(false)
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return checkoutState.serviceType !== null
      case 2:
        const hasRequiredInfo =
          checkoutState.customerInfo.name.trim() !== "" && checkoutState.customerInfo.phone.trim() !== ""
        const hasDeliveryAddress =
          checkoutState.serviceType !== "delivery" ||
          (checkoutState.deliveryAddress?.street &&
            checkoutState.deliveryAddress?.number &&
            checkoutState.deliveryAddress?.city)
        return hasRequiredInfo && hasDeliveryAddress
      case 3:
        const hasPaymentMethod = checkoutState.paymentMethod !== null
        const hasCashAmount =
          checkoutState.paymentMethod !== "cash" ||
          checkoutState.needsChange === false ||
          (checkoutState.needsChange && checkoutState.cashAmount.trim() !== "")
        return hasPaymentMethod && hasCashAmount
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    try {
      // Aquí implementarías la lógica para crear el pedido
      // Por ahora simularemos el proceso
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Limpiar carrito y cerrar modal
      clearCart()
      handleClose()

      // Mostrar mensaje de éxito (podrías usar un toast aquí)
      alert("¡Pedido realizado con éxito!")
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Error al procesar el pedido. Inténtalo de nuevo.")
    } finally {
      setIsProcessing(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelectionStep />
      case 2:
        return <CustomerInfoStep />
      case 3:
        return <PaymentMethodStep />
      case 4:
        return <OrderSummaryStep onPlaceOrder={handlePlaceOrder} isProcessing={isProcessing} />
      default:
        return null
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
          <DialogDescription>Completa la información para procesar tu pedido</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Paso {currentStep} de {STEPS.length}
            </span>
            <span>{STEPS[currentStep - 1]?.title}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">{renderStepContent()}</div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Resumen del Pedido</h3>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Service and Payment Info */}
              {checkoutState.serviceType && (
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Servicio:</strong>{" "}
                    {checkoutState.serviceType === "dineIn"
                      ? "En el local"
                      : checkoutState.serviceType === "delivery"
                        ? "Delivery"
                        : "Para llevar"}
                  </p>
                </div>
              )}

              {checkoutState.paymentMethod && (
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Pago:</strong>{" "}
                    {availablePaymentMethods.find((p) => p.id === checkoutState.paymentMethod)?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNextStep} disabled={!canProceedToNextStep()}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handlePlaceOrder}
              disabled={!canProceedToNextStep() || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Pedido"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
