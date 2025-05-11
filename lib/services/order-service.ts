import { db } from "@/lib/firebase/admin"
import type { Order, OrderFormData, OrderStatus, OrderType } from "@/lib/types/order"
import { Timestamp } from "firebase-admin/firestore"

// Función para obtener todos los pedidos de una sucursal
export async function getOrders(tenantId: string, branchId: string): Promise<Order[]> {
  try {
    const ordersSnapshot = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get()

    return ordersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as Order
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders")
  }
}

// Función para obtener pedidos por tipo
export async function getOrdersByType(tenantId: string, branchId: string, type: OrderType): Promise<Order[]> {
  try {
    const ordersSnapshot = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .where("type", "==", type)
      .orderBy("createdAt", "desc")
      .get()

    return ordersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as Order
    })
  } catch (error) {
    console.error(`Error fetching ${type} orders:`, error)
    throw new Error(`Failed to fetch ${type} orders`)
  }
}

// Función para obtener pedidos recientes
export async function getRecentOrders(tenantId: string, branchId: string, limit = 5): Promise<Order[]> {
  try {
    const ordersSnapshot = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    return ordersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      } as Order
    })
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    throw new Error("Failed to fetch recent orders")
  }
}

// Función para crear un nuevo pedido
export async function createOrder(tenantId: string, branchId: string, orderData: OrderFormData): Promise<string> {
  try {
    // Calcular subtotal
    const subtotal = orderData.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    // Calcular impuestos (10% por defecto)
    const tax = subtotal * 0.1

    // Calcular tarifa de entrega si es delivery
    const deliveryFee = orderData.type === "delivery" ? 5 : 0

    // Calcular total
    const total = subtotal + tax + deliveryFee

    // Generar número de orden (timestamp + 4 dígitos aleatorios)
    const timestamp = Date.now()
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const orderNumber = `${timestamp.toString().slice(-6)}${randomDigits}`

    // Crear objeto de pedido
    const newOrder: Omit<Order, "id"> = {
      orderNumber,
      type: orderData.type,
      status: "new",
      items: orderData.items.map((item) => ({
        id: crypto.randomUUID(),
        ...item,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      tax,
      deliveryFee: orderData.type === "delivery" ? deliveryFee : undefined,
      total,
      tableNumber: orderData.tableNumber,
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "pending",
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      branchId,
    }

    // Guardar en Firestore
    const orderRef = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .add({
        ...newOrder,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

    return orderRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("Failed to create order")
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
    await db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .doc(orderId)
      .update({
        status,
        updatedAt: Timestamp.now(),
      })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error("Failed to update order status")
  }
}

// Función para obtener mesas disponibles
export async function getAvailableTables(tenantId: string, branchId: string): Promise<string[]> {
  // Simulación de mesas disponibles
  // En una implementación real, esto debería verificar qué mesas están ocupadas
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
}
