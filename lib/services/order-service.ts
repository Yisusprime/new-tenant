import { ref, get, set, update, remove, push, query, orderByChild, equalTo } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"

export type OrderType = "dine_in" | "takeaway" | "delivery"

export type OrderStatus =
  | "new"
  | "received"
  | "preparing"
  | "ready"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  notes?: string
  extras?: {
    id: string
    name: string
    price: number
  }[]
}

export interface OrderCustomer {
  name: string
  phone?: string
  email?: string
  address?: string
}

export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  status: OrderStatus
  items: OrderItem[]
  customer: OrderCustomer
  tableNumber?: string
  total: number
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
  branchId: string
}

export interface CreateOrderData {
  type: OrderType
  items: OrderItem[]
  customer: OrderCustomer
  tableNumber?: string
  paymentMethod: string
  notes?: string
  branchId: string
}

// Función para generar un número de pedido único
function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${year}${month}${day}-${random}`
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

// Función para obtener pedidos por tipo
export async function getOrdersByType(tenantId: string, branchId: string, type: OrderType): Promise<Order[]> {
  try {
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersQuery = query(ordersRef, orderByChild("type"), equalTo(type))
    const snapshot = await get(ordersQuery)

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
    console.error(`Error al obtener pedidos de tipo ${type}:`, error)
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
export async function createOrder(tenantId: string, branchId: string, orderData: Omit<Order, "id">): Promise<Order> {
  try {
    const timestamp = new Date().toISOString()
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)

    // Generar un nuevo ID para el pedido
    const newOrderRef = push(ordersRef)
    const orderId = newOrderRef.key!

    const newOrder = {
      id: orderId,
      orderNumber: generateOrderNumber(),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...orderData,
    }

    // Guardar el pedido en Realtime Database
    await set(newOrderRef, newOrder)

    return newOrder as Order
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
): Promise<void> {
  try {
    const timestamp = new Date().toISOString()
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)

    // Actualizar el estado y la fecha de actualización
    await update(orderRef, {
      status,
      updatedAt: timestamp,
    })
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error)
    throw error
  }
}

// Función para eliminar un pedido
export async function deleteOrder(tenantId: string, branchId: string, orderId: string): Promise<void> {
  try {
    const orderRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders/${orderId}`)
    await remove(orderRef)
  } catch (error) {
    console.error("Error al eliminar pedido:", error)
    throw error
  }
}

// Función para obtener los pedidos recientes (últimos 5)
export async function getRecentOrders(tenantId: string, branchId: string, limit = 5): Promise<Order[]> {
  try {
    const orders = await getOrders(tenantId, branchId)
    return orders.slice(0, limit)
  } catch (error) {
    console.error("Error al obtener pedidos recientes:", error)
    throw error
  }
}

// Función para obtener pedidos por estado
export async function getOrdersByStatus(tenantId: string, branchId: string, status: OrderStatus): Promise<Order[]> {
  try {
    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersQuery = query(ordersRef, orderByChild("status"), equalTo(status))
    const snapshot = await get(ordersQuery)

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
    console.error(`Error al obtener pedidos con estado ${status}:`, error)
    throw error
  }
}

// Función para obtener pedidos activos (no completados ni cancelados)
export async function getActiveOrders(tenantId: string, branchId: string): Promise<Order[]> {
  try {
    const orders = await getOrders(tenantId, branchId)
    return orders.filter((order) => order.status !== "completed" && order.status !== "cancelled")
  } catch (error) {
    console.error("Error al obtener pedidos activos:", error)
    throw error
  }
}

export async function getAvailableTables(tenantId: string, branchId: string): Promise<string[]> {
  // This is a mock implementation. Replace with actual logic to fetch available tables.
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
}
