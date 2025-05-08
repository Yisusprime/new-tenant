"use client"

import type { ReactNode } from "react"
import { usePlan } from "@/lib/context/plan-context"
import type { PlanPermissions } from "@/lib/types/plans"
import { AlertCircle, Lock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PlanFeatureProps {
  feature: keyof PlanPermissions["features"]
  children: ReactNode
  fallback?: ReactNode
}

export function PlanFeature({ feature, children, fallback }: PlanFeatureProps) {
  const { hasFeature, plan } = usePlan()

  const hasAccess = hasFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Característica no disponible</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Esta característica solo está disponible en planes superiores. Tu plan actual es{" "}
          <span className="font-semibold">{plan.toUpperCase()}</span>.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/admin/settings/plan">Actualizar Plan</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}

interface PlanLimitProps {
  limitType: "maxBranches" | "maxProducts" | "maxUsers"
  currentCount: number
  children: ReactNode
  fallback?: ReactNode
}

export function PlanLimit({ limitType, currentCount, children, fallback }: PlanLimitProps) {
  const { hasReachedLimit, plan } = usePlan()

  const limitReached = hasReachedLimit(limitType, currentCount)

  if (!limitReached) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const limitLabels = {
    maxBranches: "sucursales",
    maxProducts: "productos",
    maxUsers: "usuarios",
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Límite alcanzado</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p className="mb-2">
          Has alcanzado el límite de {limitLabels[limitType]} para tu plan actual ({plan.toUpperCase()}).
        </p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href="/admin/settings/plan">Actualizar Plan</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
