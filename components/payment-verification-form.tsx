"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import { verifyPayment } from "@/lib/services/cash-register-service"
import type { CashMovement } from "@/lib/types/cash-register"

interface PaymentVerificationFormProps {
  tenantId: string
  branchId: string
  userId: string
  movement: CashMovement
  onSuccess: (movement: CashMovement) => void
  onCancel: () => void
}

export function PaymentVerificationForm({
  tenantId,
  branchId,
  userId,
  movement,
  onSuccess,
  onCancel,
}: PaymentVerificationFormProps) {
  const [status, setStatus] = useState<"verified" | "rejected">(
    movement.verificationStatus === "verified" ? "verified" : "rejected",
  )
  const [transactionId, setTransactionId] = useState(movement.transactionId || "")
  const [notes, setNotes] = useState(movement.verificationNotes || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      const updatedMovement = await verifyPayment(tenantId, branchId, userId, movement.id, {
        status,
        transactionId,
        notes,
      })

      onSuccess(updatedMovement)
    } catch (error) {
      console.error("Error al verificar pago:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="status">Estado de verificación</Label>
        <RadioGroup
          id="status"
          value={status}
          onValueChange={(value) => setStatus(value as "verified" | "rejected")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="verified" id="verified" />
            <Label htmlFor="verified" className="font-normal cursor-pointer">
              Verificado - El pago ha sido recibido correctamente
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rejected" id="rejected" />
            <Label htmlFor="rejected" className="font-normal cursor-pointer">
              Rechazado - El pago no ha sido recibido o hay problemas
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionId">
          {movement.paymentMethod === "transfer" ? "Número de transferencia" : "Número de autorización"}
        </Label>
        <Input
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder={
            movement.paymentMethod === "transfer"
              ? "Ingrese el número de transferencia"
              : "Ingrese el número de autorización"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas adicionales</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ingrese notas adicionales sobre la verificación"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar
        </Button>
      </div>
    </form>
  )
}
