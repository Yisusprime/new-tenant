"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { type PlanType, type getPlanPermissions, hasFeature, hasReachedLimit } from "@/lib/types/plans"

interface PlanContextType {
  plan: PlanType
  isLoading: boolean
  error: string | null
  hasFeature: (feature: keyof ReturnType<typeof getPlanPermissions>["features"]) => boolean
  hasReachedLimit: (limitType: "maxBranches" | "maxProducts" | "maxUsers", currentCount: number) => boolean
  refreshPlan: () => Promise<void>
}

const PlanContext = createContext<PlanContextType>({
  plan: "free",
  isLoading: true,
  error: null,
  hasFeature: () => false,
  hasReachedLimit: () => true,
  refreshPlan: async () => {},
})

export const usePlan = () => useContext(PlanContext)

export function PlanProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const [plan, setPlan] = useState<PlanType>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const tenantDoc = await getDoc(doc(db, "tenants", tenantId))

      if (!tenantDoc.exists()) {
        throw new Error("Tenant no encontrado")
      }

      const tenantData = tenantDoc.data()
      setPlan(tenantData?.plan || "free")
    } catch (err) {
      console.error("Error al obtener el plan:", err)
      setError("No se pudo cargar la información del plan")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchPlan()
    }
  }, [tenantId])

  const checkFeature = (feature: keyof ReturnType<typeof getPlanPermissions>["features"]) => {
    return hasFeature(plan, feature)
  }

  const checkLimit = (limitType: "maxBranches" | "maxProducts" | "maxUsers", currentCount: number) => {
    return hasReachedLimit(plan, limitType, currentCount)
  }

  return (
    <PlanContext.Provider
      value={{
        plan,
        isLoading,
        error,
        hasFeature: checkFeature,
        hasReachedLimit: checkLimit,
        refreshPlan: fetchPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}
