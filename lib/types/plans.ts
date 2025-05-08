// Tipos de planes disponibles
export type PlanType = "free" | "basic" | "premium" | "enterprise"

// Definición de permisos por funcionalidad
export interface PlanPermissions {
  maxBranches: number
  maxProducts: number
  maxUsers: number
  features: {
    onlineOrders: boolean
    inventory: boolean
    analytics: boolean
    customDomain: boolean
    api: boolean
    support: boolean
    whiteLabel: boolean
  }
}

// Configuración de permisos para cada plan
export const PLAN_CONFIGS: Record<PlanType, PlanPermissions> = {
  free: {
    maxBranches: 1,
    maxProducts: 20,
    maxUsers: 2,
    features: {
      onlineOrders: false,
      inventory: false,
      analytics: false,
      customDomain: false,
      api: false,
      support: false,
      whiteLabel: false,
    },
  },
  basic: {
    maxBranches: 3,
    maxProducts: 100,
    maxUsers: 5,
    features: {
      onlineOrders: true,
      inventory: true,
      analytics: false,
      customDomain: false,
      api: false,
      support: false,
      whiteLabel: false,
    },
  },
  premium: {
    maxBranches: 10,
    maxProducts: 500,
    maxUsers: 15,
    features: {
      onlineOrders: true,
      inventory: true,
      analytics: true,
      customDomain: true,
      api: false,
      support: true,
      whiteLabel: false,
    },
  },
  enterprise: {
    maxBranches: -1, // Ilimitado
    maxProducts: -1, // Ilimitado
    maxUsers: -1, // Ilimitado
    features: {
      onlineOrders: true,
      inventory: true,
      analytics: true,
      customDomain: true,
      api: true,
      support: true,
      whiteLabel: true,
    },
  },
}

// Función para obtener los permisos de un plan
export function getPlanPermissions(planType: PlanType): PlanPermissions {
  return PLAN_CONFIGS[planType] || PLAN_CONFIGS.free
}

// Función para verificar si un plan tiene acceso a una característica
export function hasFeature(planType: PlanType, feature: keyof PlanPermissions["features"]): boolean {
  const plan = PLAN_CONFIGS[planType] || PLAN_CONFIGS.free
  return plan.features[feature] === true
}

// Función para verificar si un plan ha alcanzado un límite
export function hasReachedLimit(
  planType: PlanType,
  limitType: "maxBranches" | "maxProducts" | "maxUsers",
  currentCount: number,
): boolean {
  const plan = PLAN_CONFIGS[planType] || PLAN_CONFIGS.free
  const limit = plan[limitType]

  // Si el límite es -1, significa ilimitado
  if (limit === -1) return false

  return currentCount >= limit
}
