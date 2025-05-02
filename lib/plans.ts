export type PlanType = "free" | "basic" | "pro" | "enterprise"

export interface PlanLimits {
  customDomains: number
  storage: number // en GB
  users: number
  features: string[]
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    customDomains: 0,
    storage: 1,
    users: 2,
    features: ["Subdominio básico", "1GB almacenamiento", "2 usuarios"],
  },
  basic: {
    customDomains: 1,
    storage: 5,
    users: 10,
    features: ["1 dominio personalizado", "5GB almacenamiento", "10 usuarios", "Soporte por email"],
  },
  pro: {
    customDomains: 3,
    storage: 20,
    users: 50,
    features: ["3 dominios personalizados", "20GB almacenamiento", "50 usuarios", "Soporte prioritario"],
  },
  enterprise: {
    customDomains: 10,
    storage: 100,
    users: 200,
    features: ["10 dominios personalizados", "100GB almacenamiento", "200 usuarios", "Soporte 24/7"],
  },
}

export async function checkDomainLimit(tenantId: string, plan: PlanType): Promise<boolean> {
  try {
    // Llamar a la API route para verificar el límite de dominios
    const response = await fetch(
      `/api/domains/check-limit?tenantId=${encodeURIComponent(tenantId)}&plan=${encodeURIComponent(plan)}`,
    )

    if (!response.ok) {
      throw new Error(`Error checking domain limit: ${response.statusText}`)
    }

    const data = await response.json()
    return data.canAddDomain
  } catch (error) {
    console.error("Error in checkDomainLimit:", error)
    return false
  }
}
