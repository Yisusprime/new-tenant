import { ref, get, set, push, update } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type {
  CashRegister,
  CashRegisterFormData,
  CashRegisterCloseData,
  CashRegisterSummary,
} from "@/lib/types/cash-register"
import { getOrders } from "./order-service"

// Función para obtener la caja actual (abierta)
export async function getCurrentCashRegister(tenantId: string, branchId: string): Promise<CashRegister | null> {
  try {
    const cashRegistersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)
    const snapshot = await get(cashRegistersRef)

    if (!snapshot.exists()) {
      return null
    }

    const cashRegisters = snapshot.val()

    // Buscar la caja abierta
    for (const id in cashRegisters) {
      if (cashRegisters[id].status === "open") {
        return {
          id,
          ...cashRegisters[id],
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error al obtener la caja actual:", error)
    throw error
  }
}

// Función para obtener todas las cajas
export async function getCashRegisters(tenantId: string, branchId: string): Promise<CashRegister[]> {
  try {
    const cashRegistersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)
    const snapshot = await get(cashRegistersRef)

    if (!snapshot.exists()) {
      return []
    }

    const cashRegistersData = snapshot.val()

    // Convertir el objeto a un array
    const cashRegisters = Object.entries(cashRegistersData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashRegister[]

    // Ordenar por fecha de apertura (más reciente primero)
    return cashRegisters.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime())
  } catch (error) {
    console.error("Error al obtener las cajas:", error)
    throw error
  }
}

// Función para obtener una caja específica
export async function getCashRegister(
  tenantId: string,
  branchId: string,
  cashRegisterId: string,
): Promise<CashRegister | null> {
  try {
    const cashRegisterRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters/${cashRegisterId}`)
    const snapshot = await get(cashRegisterRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: cashRegisterId,
      ...snapshot.val(),
    } as CashRegister
  } catch (error) {
    console.error("Error al obtener la caja:", error)
    throw error
  }
}

// Función para abrir una nueva caja
export async function openCashRegister(
  tenantId: string,
  branchId: string,
  userId: string,
  data: CashRegisterFormData,
): Promise<CashRegister> {
  try {
    // Verificar si ya hay una caja abierta
    const currentCashRegister = await getCurrentCashRegister(tenantId, branchId)
    if (currentCashRegister) {
      throw new Error("Ya hay una caja abierta. Debe cerrarla antes de abrir una nueva.")
    }

    const timestamp = new Date().toISOString()
    const cashRegistersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)

    // Generar un nuevo ID para la caja
    const newCashRegisterRef = push(cashRegistersRef)
    const cashRegisterId = newCashRegisterRef.key!

    const newCashRegister: Omit<CashRegister, "id"> = {
      branchId,
      openedAt: timestamp,
      initialAmount: data.initialAmount,
      status: "open",
      openedBy: userId,
      notes: data.notes || "",
      summary: {
        totalOrders: 0,
        totalSales: 0,
        totalCash: 0,
        totalCard: 0,
        totalOtherMethods: 0,
        totalTaxes: 0,
      },
    }

    // Guardar la caja en Realtime Database
    await set(newCashRegisterRef, newCashRegister)

    return {
      id: cashRegisterId,
      ...newCashRegister,
    } as CashRegister
  } catch (error) {
    console.error("Error al abrir la caja:", error)
    throw error
  }
}

// Función para generar el resumen de ventas
async function generateCashRegisterSummary(
  tenantId: string,
  branchId: string,
  cashRegister: CashRegister,
): Promise<CashRegisterSummary> {
  // Obtener todos los pedidos desde que se abrió la caja
  const allOrders = await getOrders(tenantId, branchId)

  // Filtrar pedidos que pertenecen a esta caja (creados después de abrir la caja)
  const cashRegisterOpenTime = new Date(cashRegister.openedAt).getTime()
  const cashRegisterOrders = allOrders.filter(
    (order) =>
      new Date(order.createdAt).getTime() >= cashRegisterOpenTime &&
      (!cashRegister.closedAt || new Date(order.createdAt).getTime() <= new Date(cashRegister.closedAt).getTime()),
  )

  // Inicializar el resumen
  const summary: CashRegisterSummary = {
    totalOrders: cashRegisterOrders.length,
    totalSales: 0,
    totalCash: 0,
    totalCard: 0,
    totalOtherMethods: 0,
    totalTaxes: 0,
    ordersByStatus: {},
    salesByHour: [],
    paymentMethods: [],
  }

  // Mapeo de horas para ventas por hora
  const salesByHour: { [hour: string]: number } = {}

  // Mapeo de métodos de pago
  const paymentMethods: { [method: string]: { amount: number; count: number } } = {}

  // Procesar cada pedido
  cashRegisterOrders.forEach((order) => {
    // Solo contar pedidos pagados para las ventas
    if (order.paymentStatus === "paid") {
      summary.totalSales += order.total
      summary.totalTaxes += order.tax || 0

      // Contabilizar por método de pago
      if (order.paymentMethod) {
        if (order.paymentMethod.toLowerCase().includes("efectivo")) {
          summary.totalCash += order.total
        } else if (order.paymentMethod.toLowerCase().includes("tarjeta")) {
          summary.totalCard += order.total
        } else {
          summary.totalOtherMethods += order.total
        }

        // Actualizar estadísticas de métodos de pago
        if (!paymentMethods[order.paymentMethod]) {
          paymentMethods[order.paymentMethod] = { amount: 0, count: 0 }
        }
        paymentMethods[order.paymentMethod].amount += order.total
        paymentMethods[order.paymentMethod].count += 1
      }

      // Ventas por hora
      const orderHour = new Date(order.createdAt).getHours().toString().padStart(2, "0") + ":00"
      if (!salesByHour[orderHour]) {
        salesByHour[orderHour] = 0
      }
      salesByHour[orderHour] += order.total
    }

    // Contabilizar por estado
    if (!summary.ordersByStatus[order.status]) {
      summary.ordersByStatus[order.status] = 0
    }
    summary.ordersByStatus[order.status] += 1
  })

  // Convertir ventas por hora a array
  summary.salesByHour = Object.entries(salesByHour)
    .map(([hour, amount]) => ({
      hour,
      amount,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour))

  // Convertir métodos de pago a array
  summary.paymentMethods = Object.entries(paymentMethods)
    .map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)

  return summary
}

// Función para cerrar la caja
export async function closeCashRegister(
  tenantId: string,
  branchId: string,
  cashRegisterId: string,
  userId: string,
  data: CashRegisterCloseData,
): Promise<CashRegister> {
  try {
    const timestamp = new Date().toISOString()
    const cashRegisterRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters/${cashRegisterId}`)

    // Obtener la caja actual
    const snapshot = await get(cashRegisterRef)
    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const currentCashRegister = {
      id: cashRegisterId,
      ...snapshot.val(),
    } as CashRegister

    if (currentCashRegister.status !== "open") {
      throw new Error("La caja ya está cerrada")
    }

    // Generar el resumen de ventas
    const summary = await generateCashRegisterSummary(tenantId, branchId, currentCashRegister)

    // Calcular el monto esperado
    const expectedAmount = currentCashRegister.initialAmount + summary.totalCash

    // Calcular la diferencia
    const difference = data.finalAmount - expectedAmount

    // Preparar datos de actualización
    const updatedData = {
      closedAt: timestamp,
      closedBy: userId,
      finalAmount: data.finalAmount,
      expectedAmount,
      difference,
      status: "closed",
      notes: data.notes || currentCashRegister.notes,
      summary,
    }

    // Actualizar la caja en Realtime Database
    await update(cashRegisterRef, updatedData)

    return {
      ...currentCashRegister,
      ...updatedData,
    } as CashRegister
  } catch (error) {
    console.error("Error al cerrar la caja:", error)
    throw error
  }
}

// Función para verificar si hay una caja abierta
export async function isCashRegisterOpen(tenantId: string, branchId: string): Promise<boolean> {
  try {
    const currentCashRegister = await getCurrentCashRegister(tenantId, branchId)
    return currentCashRegister !== null
  } catch (error) {
    console.error("Error al verificar el estado de la caja:", error)
    throw error
  }
}
