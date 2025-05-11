"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CashBox, CashCategory, CashMovementType } from "@/lib/types/cashier"
import { useCashBox } from "@/lib/hooks/use-cash-box"
import { toast } from "@/components/ui/use-toast"
import { getCashCategories } from "@/lib/services/cashier-service"

interface AddMovementDialogProps {
  isOpen: boolean
  onClose: () => void
  cashBox: CashBox
  onSuccess?: () => void
}

export function AddMovementDialog({ isOpen, onClose, cashBox, onSuccess }: AddMovementDialogProps) {
  const [type, setType] = useState<CashMovementType>("income")
  const [amount, setAmount] = useState<number>(0)
  const [description, setDescription] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [reference, setReference] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CashCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const { addCashMovement } = useCashBox()

  useEffect(() => {
    const loadCategories = async () => {
      if (!cashBox.tenantId) return

      setLoadingCategories(true)
      try {
        const cats = await getCashCategories(cashBox.tenantId)
        setCategories(cats)
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen, cashBox.tenantId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a cero",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await addCashMovement(cashBox.id, {
        type,
        amount,
        description,
        category,
        paymentMethod,
        reference,
      })

      toast({
        title: "Movimiento registrado",
        description: "El movimiento ha sido registrado correctamente",
      })

      // Limpiar formulario
      setType("income")
      setAmount(0)
      setDescription("")
      setCategory("")
      setPaymentMethod("cash")
      setReference("")

      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al registrar el movimiento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethods = [
    { id: "cash", name: "Efectivo" },
    { id: "card", name: "Tarjeta" },
    { id: "transfer", name: "Transferencia" },
    { id: "other", name: "Otro" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>Ingresa los detalles del movimiento para la caja {cashBox.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select value={type} onValueChange={(value) => setType(value as CashMovementType)} disabled={isLoading}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                className="col-span-3"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading || loadingCategories}>
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>
                      Cargando categorías...
                    </SelectItem>
                  ) : categories.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No hay categorías disponibles
                    </SelectItem>
                  ) : (
                    categories
                      .filter((cat) => cat.type === type)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Método de pago
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLoading}>
                <SelectTrigger id="paymentMethod" className="col-span-3">
                  <SelectValue placeholder="Selecciona el método de pago" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reference" className="text-right">
                Referencia
              </Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="col-span-3"
                placeholder="Número de factura, recibo, etc. (opcional)"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
