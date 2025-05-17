import { ref, get, set, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { CashAudit, CashAuditFormData, AuditStatus, CashDenominations } from "@/lib/types/cash-register"
import { getCashRegister, getCashRegisterSummary } from "./cash-register-service"

// Función para limpiar objetos antes de guardarlos en Firebase (elimina undefined)
function cleanObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }

  if (typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item)).filter((item) => item !== undefined)
  }

  return Object.entries(obj).reduce(
    (cleaned, [key, value]) => {
      const cleanedValue = cleanObject(value)
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue
      }
      return cleaned
    },
    {} as Record<string, any>,
  )
}

// Función para limpiar las denominaciones
function cleanDenominations(denominations?: CashDenominations): CashDenominations | null {
  if (!denominations) return null

  // Limpiar billetes
  const bills = Object.entries(denominations.bills || {})
    .filter(([_, count]) => count !== undefined && count !== null)
    .reduce(
      (acc, [bill, count]) => {
        acc[bill] = Number(count) || 0
        return acc
      },
      {} as Record<string, number>,
    )

  // Limpiar monedas
  const coins = Object.entries(denominations.coins || {})
    .filter(([_, count]) => count !== undefined && count !== null)
    .reduce(
      (acc, [coin, count]) => {
        acc[coin] = Number(count) || 0
        return acc
      },
      {} as Record<string, number>,
    )

  return { bills, coins }
}

// Función para crear un nuevo arqueo de caja
export async function createCashAudit(
  tenantId: string,
  branchId: string,
  userId: string,
  auditData: CashAuditFormData,
): Promise<CashAudit> {
  try {
    if (!tenantId || !branchId || !userId || !auditData.registerId) {
      throw new Error("Faltan datos requeridos para crear el arqueo de caja")
    }

    // Verificar que la caja exista
    const register = await getCashRegister(tenantId, branchId, auditData.registerId)
    if (!register) {
      throw new Error("La caja no existe")
    }

    // Obtener el resumen de la caja para calcular el efectivo esperado si no se proporcionó
    const expectedCash =
      auditData.expectedCash !== undefined
        ? auditData.expectedCash
        : (await getCashRegisterSummary(tenantId, branchId, auditData.registerId)).paymentMethodTotals.cash

    // Calcular la diferencia
    const difference = auditData.actualCash - expectedCash

    // Determinar el estado del arqueo
    let status: AuditStatus = "balanced"
    if (difference > 0) {
      status = "surplus"
    } else if (difference < 0) {
      status = "shortage"
    }

    const timestamp = new Date().toISOString()
    const auditsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashAudits`)

    // Generar un nuevo ID para el arqueo
    const newAuditRef = push(auditsRef)
    const auditId = newAuditRef.key!

    // Limpiar las denominaciones para evitar valores undefined
    const cleanedDenominations = cleanDenominations(auditData.denominations)

    // Crear el objeto del arqueo
    const newAudit: Omit<CashAudit, "id"> = {
      registerId: auditData.registerId,
      performedAt: timestamp,
      performedBy: userId,
      expectedCash,
      actualCash: auditData.actualCash,
      difference,
      status,
      notes: auditData.notes || "",
      denominations: cleanedDenominations,
      createdAt: timestamp,
    }

    // Limpiar todo el objeto para eliminar cualquier undefined
    const cleanedAudit = cleanObject(newAudit)

    // Guardar el arqueo en Realtime Database
    await set(newAuditRef, cleanedAudit)

    // Si hay diferencia, registrar un movimiento de ajuste
    if (difference !== 0 && register.status === "open") {
      // Importar de forma dinámica para evitar dependencias circulares
      const { createCashMovement } = await import("./cash-register-service")

      await createCashMovement(tenantId, branchId, userId, {
        registerId: auditData.registerId,
        type: "adjustment",
        amount: Math.abs(difference),
        description: `Ajuste por arqueo de caja: ${difference > 0 ? "sobrante" : "faltante"}`,
        paymentMethod: "cash",
        reference: `Arqueo ID: ${auditId}`,
      })
    }

    return {
      id: auditId,
      ...cleanedAudit,
    } as CashAudit
  } catch (error) {
    console.error("Error al crear arqueo de caja:", error)
    throw error
  }
}

// Función para obtener todos los arqueos de una caja
export async function getCashAudits(tenantId: string, branchId: string, registerId: string): Promise<CashAudit[]> {
  try {
    if (!tenantId || !branchId || !registerId) {
      throw new Error("Tenant ID, Branch ID y Register ID son requeridos")
    }

    const auditsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashAudits`)
    const snapshot = await get(auditsRef)

    if (!snapshot.exists()) {
      return []
    }

    const auditsData = snapshot.val()
    const allAudits = Object.entries(auditsData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashAudit[]

    // Filtrar por registerId
    const audits = allAudits.filter((audit) => audit.registerId === registerId)

    // Ordenar por fecha (más reciente primero)
    return audits.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
  } catch (error) {
    console.error("Error al obtener arqueos de caja:", error)
    throw error
  }
}

// Función para obtener un arqueo específico
export async function getCashAudit(tenantId: string, branchId: string, auditId: string): Promise<CashAudit | null> {
  try {
    if (!tenantId || !branchId || !auditId) {
      throw new Error("Tenant ID, Branch ID y Audit ID son requeridos")
    }

    const auditRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashAudits/${auditId}`)
    const snapshot = await get(auditRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: auditId,
      ...snapshot.val(),
    } as CashAudit
  } catch (error) {
    console.error("Error al obtener arqueo de caja:", error)
    throw error
  }
}

// Función para obtener el último arqueo de una caja
export async function getLastCashAudit(
  tenantId: string,
  branchId: string,
  registerId: string,
): Promise<CashAudit | null> {
  try {
    const audits = await getCashAudits(tenantId, branchId, registerId)

    if (audits.length === 0) {
      return null
    }

    // El primero es el más reciente debido al ordenamiento
    return audits[0]
  } catch (error) {
    console.error("Error al obtener último arqueo:", error)
    throw error
  }
}
