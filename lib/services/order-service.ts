import { ref, get, set, update, remove, push } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import { getRestaurantConfig } from "@/lib/services/restaurant-config-service"
import type { Order, OrderFormData, OrderStatus, OrderType } from "@/lib/types/order"

// Función para generar un número de pedido único
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `#${timestamp}${random}`
}

// Función para eliminar propiedades undefined de un objeto
function removeUndefined(obj: any): any {
  const result: any = {}
  Object.entries(obj).forEach(([key, value]) => {
    // Si el valor es undefined, no lo incluimos
    if (value === undefined) return

    // Si el valor es un objeto (pero no null ni array), procesarlo recursivamente
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = removeUndefined(value)
    } else {
      result[key] = value
    }
  })
  return result
}

// Función para obtener todos los pedidos de una sucursal
export async function getOrders(tenantId: string, branchId: string): Promise<Order[]> {
  try {
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)
    const snapshot = await get(ordersRef)

    if (!snapshot.exists()) {
      return []
    }

    const ordersData = snapshot.val()

    // Convertir el objeto a un array
    const orders = Object.entries(ordersData).map(([id, data]) => ({
      id,
      ...(data as any),
    })) as Order[]

    // Ordenar por fecha de creación (más reciente primero)
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}

// Función para obtener pedidos activos (no entregados ni cancelados)
export async function getActiveOrders(tenantId: string, branchId: string): Promise<Order[]> {
  try {
    const allOrders = await getOrders(tenantId, branchId)
    return allOrders.filter((order) => order.status !== "delivered" && order.status !== "cancelled")
  } catch (error) {
    console.error("Error al obtener pedidos activos:", error)
    throw error
  }
}

// Función para obtener pedidos por tipo (filtrado en el cliente)
export async function getOrdersByType(tenantId: string, branchId: string, type: OrderType): Promise<Order[]> {
  try {
    // Obtenemos todos los pedidos y filtramos en el cliente
    const allOrders = await getOrders(tenantId, branchId)
    return allOrders.filter((order) => order.type === type)
  } catch (error) {
    console.error(`Error al obtener pedidos de tipo ${type}:`, error)
    throw error
  }
}

// Función para obtener pedidos por mesa (filtrado en el cliente)
export async function getOrdersByTable(tenantId: string, branchId: string, tableId: string): Promise<Order[]> {
  try {
    // Obtenemos todos los pedidos y filtramos en el cliente
    const allOrders = await getOrders(tenantId, branchId)
    return allOrders.filter((order) => order.tableId === tableId)
  } catch (error) {
    console.error(`Error al obtener pedidos de la mesa ${tableId}:`, error)
    throw error
  }
}

// Función para obtener pedidos por estado (filtrado en el cliente)
export async function getOrdersByStatus(tenantId: string, branchId: string, status: OrderStatus): Promise<Order[]> {
  try {
    // Obtenemos todos los pedidos y filtramos en el cliente
    const allOrders = await getOrders(tenantId, branchId)
    return allOrders.filter((order) => order.status === status)
  } catch (error) {
    console.error(`Error al obtener pedidos con estado ${status}:`, error)
    throw error
  }
}

// Función para obtener pedidos por rango de fechas
export async function getOrdersByDateRange(
  tenantId: string,
  branchId: string,
  startDate: Date,
  endDate: Date,
): Promise<Order[]> {
  try {
    // Convertir fechas a formato ISO para comparación
    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()

    // Obtenemos todos los pedidos
    const allOrders = await getOrders(tenantId, branchId)

    // Filtramos por rango de fechas
    return allOrders.filter((order) => {
      const orderDate = order.createdAt
      return orderDate >= startIso && orderDate <= endIso
    })
  } catch (error) {
    console.error("Error al obtener pedidos por rango de fechas:", error)
    throw error
  }
}

// Función para obtener un pedido específico
export async function getOrder(tenantId: string, branchId: string, orderId: string): Promise<Order | null> {
  try {
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)
    const snapshot = await get(orderRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: orderId,
      ...snapshot.val(),
    } as Order
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    throw error
  }
}

// Función para crear un nuevo pedido
export async function createOrder(tenantId: string, branchId: string, orderData: OrderFormData): Promise<Order> {
  try {
    const timestamp = new Date().toISOString()
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)

    // Generar un nuevo ID para el pedido
    const newOrderRef = push(ordersRef)
    const orderId = newOrderRef.key!

    // Obtener la configuración del restaurante para determinar el IVA
    let taxIncluded = orderData.taxIncluded !== undefined ? orderData.taxIncluded : true
    let taxRate = 0.19 // Valor por defecto
    let shouldApplyTax = false // Por defecto, no aplicar IVA

    try {
      const config = await getRestaurantConfig(tenantId, branchId)
      if (config && config.basicInfo) {
        // Usar la configuración del restaurante
        taxIncluded = config.basicInfo.taxIncluded
        taxRate = config.basicInfo.taxRate || 0.19

        // Determinar si se debe aplicar IVA basado en la existencia de taxEnabled o en taxRate > 0
        shouldApplyTax = config.basicInfo.taxEnabled !== undefined ? config.basicInfo.taxEnabled : taxRate > 0

        console.log("Configuración de IVA cargada:", {
          taxIncluded,
          taxRate,
          shouldApplyTax,
        })
      }
    } catch (error) {
      console.error("Error al obtener configuración de IVA:", error)
      // En caso de error, usar los valores por defecto
    }

    // Calcular subtotal, impuestos y total
    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0)

    // Calcular impuestos solo si se debe aplicar IVA
    let tax = 0
    if (shouldApplyTax && !taxIncluded) {
      tax = Math.round(subtotal * taxRate)
    }

    const total = subtotal + tax + (orderData.tip || 0) - (orderData.coupon?.discount || 0)

    // Crear el objeto de pedido con valores por defecto
    const newOrderWithUndefined: Omit<Order, "id"> = {
      orderNumber: generateOrderNumber(),
      type: orderData.type,
      status: "pending",
      items: orderData.items,
      subtotal,
      tax,
      total,
      taxIncluded,
      taxEnabled: shouldApplyTax, // Guardar si el IVA está activado
      customerName: orderData.customerName || null,
      customerPhone: orderData.customerPhone || null,
      customerEmail: orderData.customerEmail || null,
      tableId: orderData.tableId || null,
      tableNumber: orderData.tableNumber || null,
      deliveryAddress: orderData.deliveryAddress || null,
      paymentMethod: orderData.paymentMethod || null,
      paymentStatus: "pending",
      cashPayment: orderData.cashPayment || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    // Eliminar propiedades con valor undefined
    const newOrder = removeUndefined(newOrderWithUndefined)

    // Guardar el pedido en Realtime Database
    await set(newOrderRef, newOrder)

    // Si es un pedido de mesa, actualizar el estado de la mesa a ocupada
    if (orderData.type === "table" && orderData.tableId) {
      const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${orderData.tableId}`)
      await update(tableRef, {
        status: "occupied",
        updatedAt: timestamp,
      })
    }

    return {
      id: orderId,
      ...newOrder,
    } as Order
  } catch (error) {
    console.error("Error al crear pedido:", error)
    throw error
  }
}

// Función para actualizar el estado de un pedido
export async function updateOrderStatus(
  tenantId: string,
  branchId: string,
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  try {
    const timestamp = new Date().toISOString()
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)

    // Obtener el pedido actual
    const snapshot = await get(orderRef)
    if (!snapshot.exists()) {
      throw new Error("El pedido no existe")
    }

    const currentOrder = snapshot.val() as Order

    // Preparar datos de actualización
    const updatedData: any = {
      status,
      updatedAt: timestamp,
    }

    // Si el estado es 'delivered' o 'cancelled', añadir completedAt
    if (status === "delivered" || status === "cancelled") {
      updatedData.completedAt = timestamp

      // Si es un pedido de mesa y está completado o cancelado, liberar la mesa
      if (currentOrder.type === "table" && currentOrder.tableId) {
        const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${currentOrder.tableId}`)
        await update(tableRef, {
          status: "available",
          updatedAt: timestamp,
        })
      }
    }

    // Actualizar el pedido en Realtime Database
    await update(orderRef, updatedData)

    return {
      id: orderId,
      ...currentOrder,
      ...updatedData,
    } as Order
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error)
    throw error
  }
}

// Función para actualizar el estado de pago de un pedido
export async function updatePaymentStatus(
  tenantId: string,
  branchId: string,
  orderId: string,
  paymentStatus: "pending" | "paid" | "failed",
): Promise<Order> {
  try {
    const timestamp = new Date().toISOString()
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)

    // Obtener el pedido actual
    const snapshot = await get(orderRef)
    if (!snapshot.exists()) {
      throw new Error("El pedido no existe")
    }

    const currentOrder = snapshot.val()

    // Actualizar el pedido en Realtime Database
    await update(orderRef, {
      paymentStatus,
      updatedAt: timestamp,
    })

    return {
      id: orderId,
      ...currentOrder,
      paymentStatus,
      updatedAt: timestamp,
    } as Order
  } catch (error) {
    console.error("Error al actualizar estado de pago:", error)
    throw error
  }
}

// Función para eliminar un pedido
export async function deleteOrder(tenantId: string, branchId: string, orderId: string): Promise<void> {
  try {
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)

    // Verificar si el pedido existe
    const snapshot = await get(orderRef)
    if (!snapshot.exists()) {
      throw new Error("El pedido no existe")
    }

    const order = snapshot.val() as Order

    // Si es un pedido de mesa, liberar la mesa
    if (order.type === "table" && order.tableId) {
      const tableRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/tables/${order.tableId}`)
      await update(tableRef, {
        status: "available",
        updatedAt: new Date().toISOString(),
      })
    }

    // Eliminar el pedido de Realtime Database
    await remove(orderRef)
  } catch (error) {
    console.error("Error al eliminar pedido:", error)
    throw error
  }
}

// Función para verificar si hay pedidos activos
export async function hasActiveOrders(tenantId: string, branchId: string): Promise<boolean> {
  try {
    const activeOrders = await getActiveOrders(tenantId, branchId)
    return activeOrders.length > 0
  } catch (error) {
    console.error("Error al verificar pedidos activos:", error)
    throw error
  }
}
