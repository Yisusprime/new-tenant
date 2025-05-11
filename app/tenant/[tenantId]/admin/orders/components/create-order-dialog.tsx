"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderTypesStep } from "./order-type-step"
import { CustomerInfoStep } from "./customer-info-step"
import { ProductsStep } from "./products-step"
import { PaymentStep } from "./payment-step"
import { OrderSummary } from "./order-summary"
import { createOrder } from "@/lib/services/order-service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useBranch } from "@/lib/context/branch-context"
import { useCashRegister } from "@/lib/context/cash-register-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OpenCashRegisterDialog } from "@/components/open-cash-register-dialog"
import type { OrderFormData, OrderType } from "@/lib/types/order"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"

export function CreateOrderDialog({
  open,
  onOpenChange,
  tenantId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
}) {
  const { toast } = useToast()
  const router = useRouter()
  const { currentBranch } = useBranch()
  const { isOpen: isCashRegisterOpen } = useCashRegister()
  const [openCashRegisterDialog, setOpenCashRegisterDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("type")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [taxConfig, setTaxConfig] = useState({
    taxIncluded: false,
    taxRate: 0.19,
    taxEnabled: true,
  })

  // Estado del formulario
  const [formData, setFormData] = useState<OrderFormData>({
    type: "local",
    items: [],
    taxIncluded: false,
    taxEnabled: true,
  })

  // Cargar la configuración de impuestos
  useEffect(() => {
    async function loadTaxConfig() {
      if (currentBranch) {
        try {
          const config = await getRestaurantConfig(tenantId, currentBranch.id)
          if (config && config.basicInfo) {
            setTaxConfig({
              taxIncluded: config.basicInfo.taxIncluded || false,
              taxRate: config.basicInfo.taxRate || 0.19,
              taxEnabled:
                config.basicInfo.taxEnabled !== undefined ? config.basicInfo.taxEnabled : config.basicInfo.taxRate > 0,
            })

            // Actualizar el formData con la configuración de impuestos
            setFormData((prev) => ({
              ...prev,
              taxIncluded: config.basicInfo.taxIncluded || false,
              taxEnabled:
                config.basicInfo.taxEnabled !== undefined ? config.basicInfo.taxEnabled : config.basicInfo.taxRate > 0,
            }))
          }
        } catch (error) {
          console.error("Error al cargar la configuración de impuestos:", error)
        }
      }
    }

    loadTaxConfig()
  }, [tenantId, currentBranch])

  // Función para actualizar el tipo de pedido
  const handleTypeChange = (type: OrderType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      // Limpiar campos específicos al cambiar el tipo
      tableId: type === "table" ? prev.tableId : undefined,
      tableNumber: type === "table" ? prev.tableNumber : undefined,
      deliveryAddress: type === "delivery" ? prev.deliveryAddress : undefined,
    }))
    setActiveTab("customer")
  }

  // Función para actualizar la información del cliente
  const handleCustomerInfoChange = (customerInfo: Partial<OrderFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...customerInfo,
    }))
    setActiveTab("products")
  }

  // Función para actualizar los productos
  const handleProductsChange = (items: OrderFormData["items"]) => {
    setFormData((prev) => ({
      ...prev,
      items,
    }))
    setActiveTab("payment")
  }

  // Función para actualizar la información de pago
  const handlePaymentChange = (paymentInfo: Partial<OrderFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...paymentInfo,
    }))
    handleSubmit()
  }

  // Función para enviar el formulario
  const handleSubmit = async () => {
    if (!currentBranch) {
      toast({
        title: "Error",
        description: "No hay una sucursal seleccionada",
        variant: "destructive",
      })
      return
    }

    if (!isCashRegisterOpen) {
      toast({
        title: "Error",
        description: "No hay una caja abierta. Debes abrir la caja para crear pedidos.",
        variant: "destructive",
      })
      setOpenCashRegisterDialog(true)
      return
    }

    try {
      setIsSubmitting(true)
      const order = await createOrder(tenantId, currentBranch.id, formData)

      toast({
        title: "Pedido creado",
        description: `El pedido #${order.orderNumber} ha sido creado exitosamente`,
      })

      // Cerrar el diálogo y redirigir a la página de pedidos
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error al crear el pedido:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el pedido",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reiniciar el formulario al abrir el diálogo
  useEffect(() => {
    if (open) {
      setActiveTab("type")
      setFormData({
        type: "local",
        items: [],
        taxIncluded: taxConfig.taxIncluded,
        taxEnabled: taxConfig.taxEnabled,
      })
    }
  }, [open, taxConfig])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido</DialogTitle>
          </DialogHeader>

          {!isCashRegisterOpen && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Caja cerrada</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>Debes abrir la caja para poder crear nuevos pedidos.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenCashRegisterDialog(true)}
                  className="ml-4 bg-white hover:bg-gray-100"
                >
                  Abrir Caja
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="type">Tipo</TabsTrigger>
                  <TabsTrigger value="customer">Cliente</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="payment">Pago</TabsTrigger>
                </TabsList>

                <TabsContent value="type">
                  <OrderTypesStep
                    selectedType={formData.type}
                    onTypeChange={handleTypeChange}
                    tenantId={tenantId}
                    branchId={currentBranch?.id || ""}
                  />
                </TabsContent>

                <TabsContent value="customer">
                  <CustomerInfoStep
                    formData={formData}
                    onChange={handleCustomerInfoChange}
                    onBack={() => setActiveTab("type")}
                    tenantId={tenantId}
                    branchId={currentBranch?.id || ""}
                  />
                </TabsContent>

                <TabsContent value="products">
                  <ProductsStep
                    items={formData.items}
                    onChange={handleProductsChange}
                    onBack={() => setActiveTab("customer")}
                    tenantId={tenantId}
                    branchId={currentBranch?.id || ""}
                  />
                </TabsContent>

                <TabsContent value="payment">
                  <PaymentStep
                    formData={formData}
                    onChange={handlePaymentChange}
                    onBack={() => setActiveTab("products")}
                    isSubmitting={isSubmitting}
                    taxConfig={taxConfig}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <OrderSummary formData={formData} taxConfig={taxConfig} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OpenCashRegisterDialog
        tenantId={tenantId}
        branchId={currentBranch?.id || ""}
        open={openCashRegisterDialog}
        onOpenChange={(open) => {
          setOpenCashRegisterDialog(open)
          // Si se cierra el diálogo y la caja está abierta, actualizar la página
          if (!open && isCashRegisterOpen) {
            router.refresh()
          }
        }}
      />
    </>
  )
}
