"use client"

import { useState } from "react"
import { usePlan } from "@/lib/context/plan-context"
import { type PlanType, PLAN_CONFIGS } from "@/lib/types/plans"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { useToast } from "@/components/ui/use-toast"

export default function PlanPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const { plan: currentPlan, refreshPlan } = usePlan()
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleChangePlan = async (newPlan: PlanType) => {
    if (newPlan === currentPlan) return

    try {
      setIsUpdating(true)

      // En un entorno real, aquí iría la lógica de pago
      // Por ahora, solo actualizamos el plan en Firestore
      await updateDoc(doc(db, "tenants", tenantId), {
        plan: newPlan,
      })

      // Actualizar el contexto
      await refreshPlan()

      toast({
        title: "Plan actualizado",
        description: `Tu plan ha sido actualizado a ${newPlan.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Error al actualizar el plan:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const plans: PlanType[] = ["free", "basic", "premium", "enterprise"]

  const planPrices = {
    free: "Gratis",
    basic: "$29/mes",
    premium: "$79/mes",
    enterprise: "Contactar",
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Planes y Precios</h1>
        <p className="text-gray-500 mt-1">Elige el plan que mejor se adapte a las necesidades de tu negocio</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((planType) => {
          const planConfig = PLAN_CONFIGS[planType]
          const isCurrentPlan = currentPlan === planType

          return (
            <Card key={planType} className={isCurrentPlan ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {planType.charAt(0).toUpperCase() + planType.slice(1)}
                  {isCurrentPlan && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Actual</span>
                  )}
                </CardTitle>
                <CardDescription>
                  <div className="text-2xl font-bold mt-2">{planPrices[planType]}</div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>
                      {planConfig.maxBranches === -1
                        ? "Sucursales ilimitadas"
                        : `Hasta ${planConfig.maxBranches} sucursales`}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>
                      {planConfig.maxProducts === -1
                        ? "Productos ilimitados"
                        : `Hasta ${planConfig.maxProducts} productos`}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>
                      {planConfig.maxUsers === -1 ? "Usuarios ilimitados" : `Hasta ${planConfig.maxUsers} usuarios`}
                    </span>
                  </li>

                  {Object.entries(planConfig.features).map(([feature, enabled]) => (
                    <li key={feature} className="flex items-start">
                      {enabled ? (
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-300 mr-2 shrink-0" />
                      )}
                      <span className={!enabled ? "text-gray-400" : ""}>
                        {feature === "onlineOrders" && "Pedidos en línea"}
                        {feature === "inventory" && "Gestión de inventario"}
                        {feature === "analytics" && "Analíticas avanzadas"}
                        {feature === "customDomain" && "Dominio personalizado"}
                        {feature === "api" && "Acceso a API"}
                        {feature === "support" && "Soporte prioritario"}
                        {feature === "whiteLabel" && "White label"}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : "default"}
                  disabled={isCurrentPlan || isUpdating}
                  onClick={() => handleChangePlan(planType)}
                >
                  {isCurrentPlan ? "Plan Actual" : "Seleccionar Plan"}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
