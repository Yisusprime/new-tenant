"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createCashAudit } from "@/lib/services/cash-audit-service"
import { getCashRegisterSummary } from "@/lib/services/cash-register-service"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { CashAuditFormData, CashDenominations, CashRegister, CashRegisterSummary } from "@/lib/types/cash-register"

// Definir el esquema de validación
const formSchema = z.object({
  actualCash: z.coerce.number().min(0, "El monto debe ser mayor o igual a cero"),
  notes: z.string().optional(),
})

// Definir las denominaciones de billetes y monedas (ajustar según el país)
const BILLS = ["1000", "500", "200", "100", "50", "20", "10", "5", "2", "1"]
const COINS = ["0.5", "0.25", "0.1", "0.05", "0.01"]

interface CashAuditFormProps {
  tenantId: string
  branchId: string
  userId: string
  register: CashRegister
  onSuccess: (auditId: string) => void
  onCancel: () => void
}

export function CashAuditForm({ tenantId, branchId, userId, register, onSuccess, onCancel }: CashAuditFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<CashRegisterSummary | null>(null)
  const [activeTab, setActiveTab] = useState("quick")
  const [denominations, setDenominations] = useState<CashDenominations>({
    bills: BILLS.reduce((acc, bill) => ({ ...acc, [bill]: 0 }), {}),
    coins: COINS.reduce((acc, coin) => ({ ...acc, [coin]: 0 }), {}),
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

  // Cargar el resumen de la caja
  useState(() => {
    const loadSummary = async () => {
      try {
        const data = await getCashRegisterSummary(tenantId, branchId, register.id)
        setSummary(data)
      } catch (err) {
        console.error("Error al cargar resumen:", err)
        setError("No se pudo cargar el resumen de caja")
      }
    }

    loadSummary()
  })

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
      total += Number.parseFloat(bill) * count
    })
    Object.entries(newDenominations.coins).forEach(([coin, count]) => {
      total += Number.parseFloat(coin) * count
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

      // Crear el objeto de datos para el arqueo
      const auditData: CashAuditFormData = {
        registerId: register.id,
        actualCash: values.actualCash,
        notes: values.notes,
        denominations: activeTab === "detailed" ? denominations : undefined,
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
  const expectedCash = summary?.paymentMethodTotals.cash || 0
  const actualCash = form.watch("actualCash")
  const difference = actualCash - expectedCash

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
          <Card>
            <CardHeader>
              <CardTitle>Arqueo Rápido de Caja</CardTitle>
              <CardDescription>Ingrese el monto total de efectivo contado físicamente en la caja.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="quick-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="actualCash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Efectivo Contado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number.parseFloat(e.target.value) || 0)
                            }}
                          />
                        </FormControl>
                        <FormDescription>Ingrese el monto total de efectivo contado físicamente.</FormDescription>
                        <FormMessage />
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
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" form="quick-form" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Arqueo"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Arqueo Detallado de Caja</CardTitle>
              <CardDescription>Ingrese la cantidad de cada denominación de billetes y monedas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form id="detailed-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Billetes</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {BILLS.map((bill) => (
                        <div key={`bill-${bill}`} className="flex items-center space-x-2">
                          <p className="w-16 text-sm font-medium">${bill}</p>
                          <Input
                            type="number"
                            min="0"
                            value={denominations.bills[bill]}
                            onChange={(e) =>
                              handleDenominationChange("bills", bill, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-20"
                          />
                          <p className="text-sm text-gray-500">
                            = {formatCurrency(Number.parseFloat(bill) * denominations.bills[bill])}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <h3 className="text-lg font-medium">Monedas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {COINS.map((coin) => (
                        <div key={`coin-${coin}`} className="flex items-center space-x-2">
                          <p className="w-16 text-sm font-medium">${coin}</p>
                          <Input
                            type="number"
                            min="0"
                            value={denominations.coins[coin]}
                            onChange={(e) =>
                              handleDenominationChange("coins", coin, Number.parseInt(e.target.value) || 0)
                            }
                            className="w-20"
                          />
                          <p className="text-sm text-gray-500">
                            = {formatCurrency(Number.parseFloat(coin) * denominations.coins[coin])}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
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
                          {formatCurrency(denominationsTotal - expectedCash)} ({statusText})
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
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" form="detailed-form" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Arqueo"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
