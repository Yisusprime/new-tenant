"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createCashAudit } from "@/lib/services/cash-audit-service"
import { getCashRegisterSummary } from "@/lib/services/cash-register-service"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { CashAuditFormData, CashDenominations, CashRegister } from "@/lib/types/cash-register"
import { getDenominationsForCurrency } from "@/lib/config/currency-denominations"

// Definir el esquema de validación
const formSchema = z.object({
  actualCash: z.coerce.number().min(0, "El monto debe ser mayor o igual a cero"),
  notes: z.string().optional(),
})

interface CashAuditFormProps {
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  onSuccess: (auditId: string) => void
  onCancel: () => void
  expectedCash?: number
}

export function CashAuditForm({
  tenantId,
  branchId,
  userId,
  register,
  onSuccess,
  onCancel,
  expectedCash: initialExpectedCash,
}: CashAuditFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expectedCash, setExpectedCash] = useState(initialExpectedCash || 0)
  const [activeTab, setActiveTab] = useState("quick")
  const [currencyCode, setCurrencyCode] = useState("CLP")
  const [denominations, setDenominations] = useState<CashDenominations>({
    bills: {},
    coins: {},
  })
  const [denominationsTotal, setDenominationsTotal] = useState(0)

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actualCash: 0,
      notes: "",
    },
  })

  // Cargar la configuración del restaurante para obtener la moneda
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getRestaurantConfig(tenantId, branchId)
        if (config?.basicInfo?.currencyCode) {
          setCurrencyCode(config.basicInfo.currencyCode)
        }
      } catch (err) {
        console.error("Error al cargar configuración:", err)
      }
    }

    loadConfig()
  }, [tenantId, branchId])

  // Inicializar las denominaciones cuando cambia la moneda
  useEffect(() => {
    const { bills, coins } = getDenominationsForCurrency(currencyCode)

    // Inicializar con ceros para evitar undefined
    const initializedBills = bills.reduce(
      (acc, bill) => {
        acc[bill] = 0
        return acc
      },
      {} as Record<string, number>,
    )

    const initializedCoins = coins.reduce(
      (acc, coin) => {
        acc[coin] = 0
        return acc
      },
      {} as Record<string, number>,
    )

    setDenominations({
      bills: initializedBills,
      coins: initializedCoins,
    })
  }, [currencyCode])

  // Cargar el resumen de la caja si no se proporcionó expectedCash
  useEffect(() => {
    const loadSummary = async () => {
      if (initialExpectedCash !== undefined) {
        return
      }

      try {
        const data = await getCashRegisterSummary(tenantId, branchId, register.id)
        setExpectedCash(data.paymentMethodTotals.cash || 0)
      } catch (err) {
        console.error("Error al cargar resumen:", err)
        setError("No se pudo cargar el resumen de caja")
      }
    }

    loadSummary()
  }, [tenantId, branchId, register.id, initialExpectedCash])

  // Manejar cambios en las denominaciones
  const handleDenominationChange = (type: "bills" | "coins", value: string, count: number) => {
    const newCount = count < 0 ? 0 : count
    const newDenominations = {
      ...denominations,
      [type]: {
        ...denominations[type],
        [value]: newCount,
      },
    }

    setDenominations(newDenominations)

    // Calcular el nuevo total
    let total = 0
    Object.entries(newDenominations.bills).forEach(([bill, count]) => {
      total += Number.parseFloat(bill) * (count || 0)
    })
    Object.entries(newDenominations.coins).forEach(([coin, count]) => {
      total += Number.parseFloat(coin) * (count || 0)
    })

    setDenominationsTotal(total)

    // Actualizar el formulario
    if (activeTab === "detailed") {
      form.setValue("actualCash", total)
    }
  }

  // Manejar el envío del formulario
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      setError(null)

      // Preparar las denominaciones para evitar undefined
      let auditDenominations: CashDenominations | undefined = undefined

      if (activeTab === "detailed") {
        // Filtrar solo las denominaciones con valores
        const filteredBills = Object.entries(denominations.bills).reduce(
          (acc, [bill, count]) => {
            if (count > 0) {
              acc[bill] = count
            }
            return acc
          },
          {} as Record<string, number>,
        )

        const filteredCoins = Object.entries(denominations.coins).reduce(
          (acc, [coin, count]) => {
            if (count > 0) {
              acc[coin] = count
            }
            return acc
          },
          {} as Record<string, number>,
        )

        auditDenominations = {
          bills: filteredBills,
          coins: filteredCoins,
        }
      }

      // Crear el objeto de datos para el arqueo
      const auditData: CashAuditFormData = {
        registerId: register.id,
        actualCash: activeTab === "detailed" ? denominationsTotal : values.actualCash,
        expectedCash: expectedCash,
        notes: values.notes || "",
        denominations: auditDenominations,
      }

      // Crear el arqueo
      const audit = await createCashAudit(tenantId, branchId, userId, auditData)

      // Notificar éxito
      onSuccess(audit.id)
    } catch (err) {
      console.error("Error al crear arqueo:", err)
      setError(err instanceof Error ? err.message : "Error al crear el arqueo de caja")
    } finally {
      setLoading(false)
    }
  }

  // Calcular la diferencia esperada
  const actualCash = form.watch("actualCash")
  const difference = activeTab === "detailed" ? denominationsTotal - expectedCash : actualCash - expectedCash

  // Determinar el estado del arqueo
  let status = "balanced"
  let statusText = "Cuadrado"
  let statusColor = "text-green-600"
  let statusIcon = <CheckCircle2 className="h-5 w-5 text-green-600" />

  if (difference > 0) {
    status = "surplus"
    statusText = "Sobrante"
    statusColor = "text-blue-600"
    statusIcon = <AlertCircle className="h-5 w-5 text-blue-600" />
  } else if (difference < 0) {
    status = "shortage"
    statusText = "Faltante"
    statusColor = "text-red-600"
    statusIcon = <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  // Obtener las denominaciones para la moneda actual
  const { bills, coins } = getDenominationsForCurrency(currencyCode)

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Arqueo Rápido</TabsTrigger>
          <TabsTrigger value="detailed">Arqueo Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="quick">
          <Form {...form}>
            <form id="quick-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="actualCash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Efectivo Contado</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number.parseFloat(e.target.value) || 0)
                          }}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-sm font-medium">Efectivo Esperado:</p>
                  <p className="text-lg font-bold">{formatCurrency(expectedCash)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Diferencia:</p>
                  <div className="flex items-center">
                    {statusIcon}
                    <p className={`text-lg font-bold ml-1 ${statusColor}`}>
                      {formatCurrency(difference)} ({statusText})
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observaciones sobre el arqueo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Arqueo"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="detailed">
          <Form {...form}>
            <form id="detailed-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billetes ({currencyCode})</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {bills.map((bill) => (
                      <div key={`bill-${bill}`} className="flex items-center space-x-2">
                        <p className="w-20 text-sm font-medium">${bill}</p>
                        <Input
                          type="number"
                          min="0"
                          value={denominations.bills[bill] || 0}
                          onChange={(e) =>
                            handleDenominationChange("bills", bill, Number.parseInt(e.target.value) || 0)
                          }
                          className="w-16 text-center px-1"
                        />
                        <p className="text-sm text-gray-500 flex-1 text-right">
                          = {formatCurrency(Number.parseFloat(bill) * (denominations.bills[bill] || 0))}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-medium">Monedas ({currencyCode})</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {coins.map((coin) => (
                      <div key={`coin-${coin}`} className="flex items-center space-x-2">
                        <p className="w-20 text-sm font-medium">${coin}</p>
                        <Input
                          type="number"
                          min="0"
                          value={denominations.coins[coin] || 0}
                          onChange={(e) =>
                            handleDenominationChange("coins", coin, Number.parseInt(e.target.value) || 0)
                          }
                          className="w-16 text-center px-1"
                        />
                        <p className="text-sm text-gray-500 flex-1 text-right">
                          = {formatCurrency(Number.parseFloat(coin) * (denominations.coins[coin] || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>

              <div className="grid grid-cols-3 gap-4 py-2 border-t border-b">
                <div>
                  <p className="text-sm font-medium">Total Contado:</p>
                  <p className="text-lg font-bold">{formatCurrency(denominationsTotal)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Efectivo Esperado:</p>
                  <p className="text-lg font-bold">{formatCurrency(expectedCash)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Diferencia:</p>
                  <div className="flex items-center">
                    {statusIcon}
                    <p className={`text-lg font-bold ml-1 ${statusColor}`}>
                      {formatCurrency(difference)} ({statusText})
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Observaciones sobre el arqueo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onCancel} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Arqueo"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
