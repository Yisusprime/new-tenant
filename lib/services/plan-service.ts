import { adminDb } from "@/lib/firebase/admin"
import type { PlanType } from "@/lib/types/plans"

// Función para actualizar el plan de un tenant (desde el servidor)
export async function updateTenantPlan(tenantId: string, newPlan: PlanType): Promise<boolean> {
  try {
    // Verificar si el tenant existe
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      throw new Error("Tenant no encontrado")
    }

    // Actualizar el plan
    await adminDb.collection("tenants").doc(tenantId).update({
      plan: newPlan,
      planUpdatedAt: new Date().toISOString(),
    })

    return true
  } catch (error) {
    console.error("Error al actualizar el plan:", error)
    throw error
  }
}

// Función para verificar si un tenant ha alcanzado el límite de un recurso
export async function checkResourceLimit(
  tenantId: string,
  resourceType: "branches" | "products" | "users",
): Promise<{
  hasReachedLimit: boolean
  currentCount: number
  limit: number
}> {
  try {
    // Obtener el plan actual del tenant
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      throw new Error("Tenant no encontrado")
    }

    const tenantData = tenantDoc.data()
    const planType = tenantData?.plan || "free"

    // Importar dinámicamente los límites del plan
    const { PLAN_CONFIGS } = await import("@/lib/types/plans")

    // Obtener el límite según el tipo de recurso
    let limitKey: string
    let collectionPath: string

    switch (resourceType) {
      case "branches":
        limitKey = "maxBranches"
        collectionPath = `tenants/${tenantId}/branches`
        break
      case "products":
        limitKey = "maxProducts"
        collectionPath = `tenants/${tenantId}/products`
        break
      case "users":
        limitKey = "maxUsers"
        collectionPath = `tenants/${tenantId}/roles`
        break
      default:
        throw new Error("Tipo de recurso no válido")
    }

    // Obtener el límite del plan
    const limit = PLAN_CONFIGS[planType][limitKey]

    // Si el límite es -1, significa ilimitado
    if (limit === -1) {
      return {
        hasReachedLimit: false,
        currentCount: 0,
        limit: -1,
      }
    }

    // Contar los recursos actuales
    const resourceCount = (await adminDb.collection(collectionPath).count().get()).data().count

    return {
      hasReachedLimit: resourceCount >= limit,
      currentCount: resourceCount,
      limit,
    }
  } catch (error) {
    console.error("Error al verificar el límite de recursos:", error)
    throw error
  }
}
