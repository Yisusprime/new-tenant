"use client"

import type React from "react"

import { useState } from "react"
import type { RestaurantPaymentMethods } from "@/lib/services/restaurant-config-service"
import { RestaurantConfigSteps } from "@/components/restaurant-config-steps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRestaurantConfig } from "@/hooks/use-restaurant-config"
import { useBranch } from "@/lib/context/branch-context"

export default function RestaurantPaymentMethodsPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { currentBranch } = useBranch()
  const [newMethod, setNewMethod] = useState<string>("")

  // Usar nuestro hook personalizado para cargar los datos
  const {
    data: paymentMethods,
    setData: setPaymentMethods,
    loading,
    saveData,
    saveCompleted,
  } = useRestaurantConfig<RestaurantPaymentMethods>(tenantId, "paymentMethods", {
    methods: [
      { id: "cash", name: "Efectivo", isActive: true },
      { id: "credit_card", name: "Tarjeta de Crédito", isActive: false },
      { id: "debit_card", name: "Tarjeta de Débito", isActive: false },
      { id: "transfer", name: "Transferencia Bancaria", isActive: false },
    ],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sucursal primero",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Usar el nuevo método saveData
      const success = await saveData()

      if (success) {
        // Marcar este paso como completado
        saveCompleted("payment")
      }
    } catch (error) {
      console.error("Error al guardar métodos de pago:", error)
    } finally {
      setSaving(false)
    }
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods({
      methods: paymentMethods.methods.map((method) =>
        method.id === id ? { ...method, isActive: !method.isActive } : method,
      ),
    })
  }

  const addPaymentMethod = () => {
    if (!newMethod.trim()) {
      toast({
        title: "Error",
        description: "El nombre del método de pago no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    const id = newMethod.toLowerCase().replace(/\s+/g, "_")

    // Verificar si ya existe un método con ese ID
    if (paymentMethods.methods.some((method) => method.id === id)) {
      toast({
        title: "Error",
        description: "Ya existe un método de pago con ese nombre",
        variant: "destructive",
      })
      return
    }

    setPaymentMethods({
      methods: [...paymentMethods.methods, { id, name: newMethod, isActive: true }],
    })

    setNewMethod("")
  }

  const removePaymentMethod = (id: string) => {
    setPaymentMethods({
      methods: paymentMethods.methods.filter((method) => method.id !== id),
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Métodos de Pago</h1>
      </div>

      <RestaurantConfigSteps tenantId={tenantId} currentStep="payment" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Métodos de Pago Aceptados
          </CardTitle>
          <CardDescription>Configura las formas de pago que aceptas en tu restaurante</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="payment-methods-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nuevo método de pago"
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                />
                <Button type="button" onClick={addPaymentMethod}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método de Pago</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        <Switch checked={method.isActive} onCheckedChange={() => togglePaymentMethod(method.id)} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePaymentMethod(method.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" form="payment-methods-form" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Guardar Métodos de Pago
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
