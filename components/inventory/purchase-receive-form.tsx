"use client"

import { useState } from "react"
import type { Purchase } from "@/lib/types/inventory"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePurchases } from "./purchase-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PurchaseReceiveFormProps {
  purchase: Purchase
  onSuccess: () => void
}

export function PurchaseReceiveForm({ purchase, onSuccess }: PurchaseReceiveFormProps) {
  const { receivePurchase } = usePurchases()
  const [receivedItems, setReceivedItems] = useState<{ id: string; received: number }[]>(
    purchase.items.map((item) => ({
      id: item.ingredientId,
      received: item.quantity,
    })),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiveAll, setReceiveAll] = useState(true)

  const handleReceiveAllChange = (checked: boolean) => {
    setReceiveAll(checked)
    if (checked) {
      setReceivedItems(
        purchase.items.map((item) => ({
          id: item.ingredientId,
          received: item.quantity,
        })),
      )
    }
  }

  const handleReceivedChange = (id: string, value: number) => {
    setReceivedItems((prev) => prev.map((item) => (item.id === id ? { ...item, received: value } : item)))

    // Si algún valor es diferente a la cantidad pedida, desmarcar "Recibir todo"
    const allMatch = purchase.items.every((item) => {
      const receivedItem = receivedItems.find((ri) => ri.id === item.ingredientId)
      return receivedItem && receivedItem.received === item.quantity
    })

    if (!allMatch) {
      setReceiveAll(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await receivePurchase(purchase.id, receivedItems)
      onSuccess()
    } catch (error) {
      console.error("Error al recibir compra:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox id="receiveAll" checked={receiveAll} onCheckedChange={handleReceiveAllChange} />
        <Label htmlFor="receiveAll">Recibir todas las cantidades completas</Label>
      </div>

      <div className="space-y-4">
        {purchase.items.map((item, index) => (
          <Card key={index}>
            <CardHeader className="py-3">
              <CardTitle className="text-base">{item.ingredientName}</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cantidad pedida</Label>
                  <p className="font-medium">
                    {item.quantity} {item.unit}
                  </p>
                </div>
                <div>
                  <Label htmlFor={`received-${item.ingredientId}`}>Cantidad recibida</Label>
                  <Input
                    id={`received-${item.ingredientId}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={receivedItems.find((ri) => ri.id === item.ingredientId)?.received || 0}
                    onChange={(e) => handleReceivedChange(item.ingredientId, Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Procesando..." : "Confirmar recepción"}
        </Button>
      </div>
    </div>
  )
}
