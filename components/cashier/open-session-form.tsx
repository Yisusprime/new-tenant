"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import { useCashier } from "./cashier-context"
import { useAuth } from "@/lib/auth-context"

export function OpenSessionForm() {
  const { user } = useAuth()
  const { openSession } = useCashier()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromOrders = searchParams.get("action") === "open"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [initialCash, setInitialCash] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!user) {
        throw new Error("Debes iniciar sesión para abrir caja")
      }

      await openSession(initialCash)

      setSuccess(true)

      // Si viene de la página de pedidos, redirigir de vuelta
      if (fromOrders) {
        setTimeout(() => {
          router.push("/admin/orders")
        }, 2000)
      } else {
        // Reset form after 2 seconds
        setTimeout(() => {
          setSuccess(false)
          setInitialCash(0)
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir la sesión")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Abrir Caja</CardTitle>
            <CardDescription>Ingresa el monto inicial en caja para comenzar una nueva sesión</CardDescription>
          </div>
          {fromOrders && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Pedidos
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="initialCash">Efectivo inicial</Label>
            <Input
              id="initialCash"
              type="number"
              step="0.01"
              value={initialCash || ""}
              onChange={(e) => setInitialCash(Number.parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>Sesión iniciada correctamente{fromOrders ? ". Redirigiendo..." : ""}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting || success}>
            {isSubmitting ? "Abriendo caja..." : "Abrir caja"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
