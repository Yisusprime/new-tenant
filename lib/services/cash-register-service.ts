import { ref, get, set, update, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type {
  CashRegister,
  CashMovement,
  CashRegisterFormData,
  CashMovementFormData,
  CashRegisterCloseData,
  CashRegisterSummary,
  CashRegisterStatus,
} from "@/lib/types/cash-register"

// Función para obtener todas las cajas de una sucursal
export async function getCashRegisters(tenantId: string, branchId: string): Promise<CashRegister[]> {
  try {
    if (!tenantId || !branchId) {
      throw new Error("Tenant ID y Branch ID son requeridos")
    }

    const registersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)
    const snapshot = await get(registersRef)

    if (!snapshot.exists()) {
      return []
    }

    const registersData = snapshot.val()
    const registers = Object.entries(registersData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashRegister[]

    // Ordenar por fecha de creación (más reciente primero)
    return registers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener cajas:", error)
    throw error
  }
}

// Función para obtener una caja específica
export async function getCashRegister(
  tenantId: string,
  branchId: string,
  registerId: string,
): Promise<CashRegister | null> {
  try {
    if (!tenantId || !branchId || !registerId) {
      throw new Error("Tenant ID, Branch ID y Register ID son requeridos")
    }

    const registerRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters/${registerId}`)
    const snapshot = await get(registerRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: registerId,
      ...snapshot.val(),
    } as CashRegister
  } catch (error) {
    console.error("Error al obtener caja:", error)
    throw error
  }
}

// Función para crear una nueva caja
export async function createCashRegister(
  tenantId: string,
  branchId: string,
  userId: string,
  registerData: CashRegisterFormData,
): Promise<CashRegister> {
  try {
    if (!tenantId || !branchId || !userId) {
      throw new Error("Tenant ID, Branch ID y User ID son requeridos")
    }

    const timestamp = new Date().toISOString()
    const registersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters`)

    // Generar un nuevo ID para la caja
    const newRegisterRef = push(registersRef)
    const registerId = newRegisterRef.key!

    const newRegister: Omit<CashRegister, "id"> = {
      name: registerData.name,
      description: registerData.description || "",
      status: "open",
      currentBalance: registerData.initialBalance,
      initialBalance: registerData.initialBalance,
      openedAt: timestamp,
      openedBy: userId,
      notes: registerData.notes || "",
      isActive: registerData.isActive,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Guardar la caja en Realtime Database
    await set(newRegisterRef, newRegister)

    return {
      id: registerId,
      ...newRegister,
    } as CashRegister
  } catch (error) {
    console.error("Error al crear caja:", error)
    throw error
  }
}

// Función para actualizar una caja existente
export async function updateCashRegister(
  tenantId: string,
  branchId: string,
  registerId: string,
  registerData: Partial<CashRegisterFormData>,
): Promise<CashRegister> {
  try {
    if (!tenantId || !branchId || !registerId) {
      throw new Error("Tenant ID, Branch ID y Register ID son requeridos")
    }

    const timestamp = new Date().toISOString()
    const registerRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters/${registerId}`)

    // Obtener la caja actual
    const snapshot = await get(registerRef)
    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const currentRegister = snapshot.val() as CashRegister

    // Verificar que la caja no esté cerrada
    if (currentRegister.status === "closed") {
      throw new Error("No se puede modificar una caja cerrada")
    }

    // Crear el objeto de actualización
    const updatedData = {
      ...registerData,
      updatedAt: timestamp,
    }

    // Actualizar la caja en Realtime Database
    await update(registerRef, updatedData)

    return {
      id: registerId,
      ...currentRegister,
      ...updatedData,
    } as CashRegister
  } catch (error) {
    console.error("Error al actualizar caja:", error)
    throw error
  }
}

// Función para cerrar una caja
export async function closeCashRegister(
  tenantId: string,
  branchId: string,
  registerId: string,
  userId: string,
  closeData: CashRegisterCloseData,
): Promise<CashRegister> {
  try {
    if (!tenantId || !branchId || !registerId || !userId) {
      throw new Error("Tenant ID, Branch ID, Register ID y User ID son requeridos")
    }

    const timestamp = new Date().toISOString()
    const registerRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashRegisters/${registerId}`)

    // Obtener la caja actual
    const snapshot = await get(registerRef)
    if (!snapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const currentRegister = snapshot.val() as CashRegister

    // Verificar que la caja esté abierta
    if (currentRegister.status !== "open") {
      throw new Error("La caja no está abierta")
    }

    // Calcular el balance esperado
    const summary = await getCashRegisterSummary(tenantId, branchId, registerId)

    // Crear el objeto de actualización
    const updatedData = {
      status: "closed" as CashRegisterStatus,
      closedAt: timestamp,
      closedBy: userId,
      expectedFinalBalance: summary.expectedBalance,
      notes: closeData.notes ? `${currentRegister.notes || ""}\n${closeData.notes}` : currentRegister.notes,
      updatedAt: timestamp,
    }

    // Actualizar la caja en Realtime Database
    await update(registerRef, updatedData)

    // Registrar el movimiento de ajuste si hay diferencia
    const difference = closeData.actualBalance - summary.expectedBalance
    if (difference !== 0) {
      await createCashMovement(tenantId, branchId, userId, {
        registerId,
        type: "adjustment",
        amount: difference,
        description: `Ajuste de cierre de caja ${difference > 0 ? "sobrante" : "faltante"}`,
        paymentMethod: "cash",
        reference: `Cierre de caja ${currentRegister.name}`,
      })
    }

    return {
      id: registerId,
      ...currentRegister,
      ...updatedData,
    } as CashRegister
  } catch (error) {
    console.error("Error al cerrar caja:", error)
    throw error
  }
}

// Función para obtener los movimientos de una caja
export async function getCashMovements(
  tenantId: string,
  branchId: string,
  registerId: string,
): Promise<CashMovement[]> {
  try {
    if (!tenantId || !branchId || !registerId) {
      throw new Error("Tenant ID, Branch ID y Register ID son requeridos")
    }

    // Modificación: En lugar de usar query con orderByChild y equalTo,
    // obtenemos todos los movimientos y filtramos manualmente
    const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const snapshot = await get(movementsRef)

    if (!snapshot.exists()) {
      return []
    }

    const movementsData = snapshot.val()
    const allMovements = Object.entries(movementsData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashMovement[]

    // Filtrar manualmente por registerId
    const movements = allMovements.filter((movement) => movement.registerId === registerId)

    // Ordenar por fecha de creación (más reciente primero)
    return movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    throw error
  }
}

// Función para crear un nuevo movimiento de caja
export async function createCashMovement(
  tenantId: string,
  branchId: string,
  userId: string,
  movementData: CashMovementFormData,
): Promise<CashMovement> {
  try {
    if (!tenantId || !branchId || !userId || !movementData.registerId) {
      throw new Error("Tenant ID, Branch ID, User ID y Register ID son requeridos")
    }

    const timestamp = new Date().toISOString()
    const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const registerRef = ref(
      realtimeDb,
      `tenants/${tenantId}/branches/${branchId}/cashRegisters/${movementData.registerId}`,
    )

    // Verificar que la caja exista y esté abierta
    const registerSnapshot = await get(registerRef)
    if (!registerSnapshot.exists()) {
      throw new Error("La caja no existe")
    }

    const register = registerSnapshot.val() as CashRegister
    if (register.status !== "open") {
      throw new Error("La caja no está abierta")
    }

    // Generar un nuevo ID para el movimiento
    const newMovementRef = push(movementsRef)
    const movementId = newMovementRef.key!

    // Calcular el nuevo balance de la caja
    let balanceChange = movementData.amount
    if (["expense", "refund", "withdrawal"].includes(movementData.type)) {
      balanceChange = -Math.abs(movementData.amount) // Asegurar que sea negativo
    } else if (["income", "sale", "deposit"].includes(movementData.type)) {
      balanceChange = Math.abs(movementData.amount) // Asegurar que sea positivo
    }
    // Para "adjustment", el monto puede ser positivo o negativo según se ingresó

    const newBalance = register.currentBalance + balanceChange

    // Crear el objeto del movimiento
    const newMovement: Omit<CashMovement, "id"> = {
      registerId: movementData.registerId,
      type: movementData.type,
      amount: Math.abs(movementData.amount), // Guardar siempre el valor absoluto
      description: movementData.description,
      paymentMethod: movementData.paymentMethod,
      reference: movementData.reference || "",
      orderId: movementData.orderId || "",
      orderNumber: movementData.orderNumber || "",
      createdAt: timestamp,
      createdBy: userId,
    }

    // Guardar el movimiento en Realtime Database
    await set(newMovementRef, newMovement)

    // Actualizar el balance de la caja
    await update(registerRef, {
      currentBalance: newBalance,
      updatedAt: timestamp,
    })

    return {
      id: movementId,
      ...newMovement,
    } as CashMovement
  } catch (error) {
    console.error("Error al crear movimiento:", error)
    throw error
  }
}

// Función para obtener el resumen de una caja
export async function getCashRegisterSummary(
  tenantId: string,
  branchId: string,
  registerId: string,
): Promise<CashRegisterSummary> {
  try {
    if (!tenantId || !branchId || !registerId) {
      throw new Error("Tenant ID, Branch ID y Register ID son requeridos")
    }

    // Obtener la caja
    const register = await getCashRegister(tenantId, branchId, registerId)
    if (!register) {
      throw new Error("La caja no existe")
    }

    // Obtener los movimientos
    const movements = await getCashMovements(tenantId, branchId, registerId)

    // Inicializar el resumen
    const summary: CashRegisterSummary = {
      totalIncome: 0,
      totalExpense: 0,
      totalSales: 0,
      totalRefunds: 0,
      totalWithdrawals: 0,
      totalDeposits: 0,
      totalAdjustments: 0,
      expectedBalance: register.initialBalance,
      actualBalance: register.currentBalance,
      difference: 0,
      paymentMethodTotals: {
        cash: 0,
        card: 0,
        transfer: 0,
        app: 0,
        other: 0,
      },
    }

    // Obtener todos los pedidos para verificar su estado
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersSnapshot = await get(ordersRef)
    const orders = ordersSnapshot.exists() ? ordersSnapshot.val() : {}

    // Calcular totales por tipo de movimiento
    for (const movement of movements) {
      const amount = movement.amount

      // Verificar si el movimiento está relacionado con un pedido cancelado
      let isCancelledOrder = false
      if (movement.orderId && movement.type === "sale") {
        const order = orders[movement.orderId]
        if (order && order.status === "cancelled") {
          isCancelledOrder = true
        }
      }

      // Si es un pedido cancelado, no sumarlo a los totales
      if (isCancelledOrder) {
        continue
      }

      switch (movement.type) {
        case "income":
          summary.totalIncome += amount
          summary.paymentMethodTotals[movement.paymentMethod] += amount
          break
        case "expense":
          summary.totalExpense += amount
          break
        case "sale":
          summary.totalSales += amount
          summary.paymentMethodTotals[movement.paymentMethod] += amount
          break
        case "refund":
          summary.totalRefunds += amount
          break
        case "withdrawal":
          summary.totalWithdrawals += amount
          break
        case "deposit":
          summary.totalDeposits += amount
          summary.paymentMethodTotals[movement.paymentMethod] += amount
          break
        case "adjustment":
          // Para ajustes, el monto puede ser positivo o negativo
          if (amount > 0) {
            summary.totalAdjustments += amount
          } else {
            summary.totalAdjustments -= amount
          }
          break
      }
    }

    // Calcular el balance esperado
    summary.expectedBalance =
      register.initialBalance +
      summary.totalIncome +
      summary.totalSales +
      summary.totalDeposits -
      summary.totalExpense -
      summary.totalRefunds -
      summary.totalWithdrawals

    // Calcular la diferencia
    summary.difference = summary.actualBalance - summary.expectedBalance

    return summary
  } catch (error) {
    console.error("Error al obtener resumen de caja:", error)
    throw error
  }
}

// Función para obtener las cajas abiertas de una sucursal
export async function getOpenCashRegisters(tenantId: string, branchId: string): Promise<CashRegister[]> {
  try {
    if (!tenantId || !branchId) {
      throw new Error("Tenant ID y Branch ID son requeridos")
    }

    const registers = await getCashRegisters(tenantId, branchId)
    return registers.filter((register) => register.status === "open")
  } catch (error) {
    console.error("Error al obtener cajas abiertas:", error)
    throw error
  }
}

// Función para registrar una venta en la caja
export async function registerSale(
  tenantId: string,
  branchId: string,
  userId: string,
  registerId: string,
  orderId: string,
  orderNumber: string,
  amount: number,
  paymentMethod: string,
): Promise<CashMovement> {
  try {
    if (!tenantId || !branchId || !userId || !registerId || !orderId) {
      throw new Error("Faltan datos requeridos para registrar la venta")
    }

    // Verificar el estado del pedido antes de registrar la venta
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)
    const orderSnapshot = await get(orderRef)

    if (!orderSnapshot.exists()) {
      throw new Error("El pedido no existe")
    }

    const order = orderSnapshot.val()

    // Si el pedido está cancelado, no registrar como venta
    if (order.status === "cancelled") {
      throw new Error("No se puede registrar una venta de un pedido cancelado")
    }

    return await createCashMovement(tenantId, branchId, userId, {
      registerId,
      type: "sale",
      amount,
      description: `Venta - Pedido #${orderNumber}`,
      paymentMethod: paymentMethod as any,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error("Error al registrar venta:", error)
    throw error
  }
}

// Función para registrar un reembolso en la caja
export async function registerRefund(
  tenantId: string,
  branchId: string,
  userId: string,
  registerId: string,
  orderId: string,
  orderNumber: string,
  amount: number,
  paymentMethod: string,
  reason: string,
): Promise<CashMovement> {
  try {
    if (!tenantId || !branchId || !userId || !registerId || !orderId) {
      throw new Error("Faltan datos requeridos para registrar el reembolso")
    }

    return await createCashMovement(tenantId, branchId, userId, {
      registerId,
      type: "refund",
      amount,
      description: `Reembolso - Pedido #${orderNumber} - ${reason}`,
      paymentMethod: paymentMethod as any,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error("Error al registrar reembolso:", error)
    throw error
  }
}

// Función para cancelar una venta en la caja cuando se cancela un pedido
export async function cancelSale(
  tenantId: string,
  branchId: string,
  userId: string,
  registerId: string,
  orderId: string,
  orderNumber: string,
  amount: number,
  paymentMethod: string,
): Promise<CashMovement> {
  try {
    if (!tenantId || !branchId || !userId || !registerId || !orderId) {
      throw new Error("Faltan datos requeridos para cancelar la venta")
    }

    return await createCashMovement(tenantId, branchId, userId, {
      registerId,
      type: "refund", // Usamos refund para cancelaciones
      amount,
      description: `Cancelación - Pedido #${orderNumber}`,
      paymentMethod: paymentMethod as any,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error("Error al cancelar venta:", error)
    throw error
  }
}

// Función para obtener todos los movimientos de caja
export async function getAllCashMovements(tenantId: string, branchId: string): Promise<CashMovement[]> {
  try {
    if (!tenantId || !branchId) {
      throw new Error("Tenant ID y Branch ID son requeridos")
    }

    const movementsRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/cashMovements`)
    const snapshot = await get(movementsRef)

    if (!snapshot.exists()) {
      return []
    }

    const movementsData = snapshot.val()
    const movements = Object.entries(movementsData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as CashMovement[]

    // Ordenar por fecha de creación (más reciente primero)
    return movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener todos los movimientos:", error)
    throw error
  }
}

// NUEVAS FUNCIONES REQUERIDAS

// Función para obtener la caja activa de una sucursal
export async function getActiveCashRegister(tenantId: string, branchId: string): Promise<CashRegister | null> {
  try {
    if (!tenantId || !branchId) {
      throw new Error("Tenant ID y Branch ID son requeridos")
    }

    // Obtener las cajas abiertas usando la función existente
    const openRegisters = await getOpenCashRegisters(tenantId, branchId)

    // Si hay cajas abiertas, devolver la primera (más reciente)
    return openRegisters.length > 0 ? openRegisters[0] : null
  } catch (error) {
    console.error("Error al obtener caja activa:", error)
    throw error
  }
}

// Función para obtener el historial de cajas de una sucursal
export async function getCashRegisterHistory(tenantId: string, branchId: string, limit = 5): Promise<CashRegister[]> {
  try {
    if (!tenantId || !branchId) {
      throw new Error("Tenant ID y Branch ID son requeridos")
    }

    // Obtener todas las cajas usando la función existente
    const registers = await getCashRegisters(tenantId, branchId)

    // Filtrar solo las cajas cerradas
    const closedRegisters = registers.filter((register) => register.status === "closed")

    // Devolver solo la cantidad solicitada
    return closedRegisters.slice(0, limit)
  } catch (error) {
    console.error("Error al obtener historial de cajas:", error)
    throw error
  }
}
