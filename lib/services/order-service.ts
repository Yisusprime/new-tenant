import {
  collection,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  query as firestoreQuery,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"

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
  id?: string
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal?: number
  notes?: string
  extras?: {
    id: string
    name: string
    price: number
  }[]
}

export interface CustomerInfo {
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
  customer: CustomerInfo
  tableNumber?: string
  subtotal?: number
  tax?: number
  deliveryFee?: number
  total: number
  paymentMethod: string
  paymentStatus?: string
  notes?: string
  createdAt: string
  updatedAt: string
  branchId: string
}

export interface OrderFormData {
  type: OrderType
  items: Omit<OrderItem, "id" | "subtotal">[]
  tableNumber?: string
  customer?: CustomerInfo
  paymentMethod: string
  notes?: string
}

// Función para obtener todos los pedidos
export async function getOrders(tenantId: string, branchId: string): Promise<Order[]> {
  try {
    console.log(`Fetching all orders for tenant ${tenantId}, branch ${branchId}`)
    const ordersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersQuery = firestoreQuery(ordersCollection, orderBy("createdAt", "desc"))

    const snapshot = await getDocs(ordersQuery)

    if (snapshot.empty) {
      console.log("No orders found in Firestore")
      return []
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Order
    })

    console.log(`Found ${orders.length} orders in Firestore`)
    return orders
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error)
    return []
  }
}

// Función para obtener pedidos por tipo
export async function getOrdersByType(tenantId: string, branchId: string, type: OrderType): Promise<Order[]> {
  try {
    console.log(`Fetching ${type} orders for tenant ${tenantId}, branch ${branchId}`)
    const ordersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersQuery = firestoreQuery(ordersCollection, where("type", "==", type), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(ordersQuery)

    if (snapshot.empty) {
      console.log(`No ${type} orders found in Firestore`)
      return []
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Order
    })

    console.log(`Found ${orders.length} ${type} orders in Firestore`)
    return orders
  } catch (error) {
    console.error(`Error fetching ${type} orders from Firestore:`, error)
    return []
  }
}

// Función para obtener los pedidos recientes de una sucursal
export async function getRecentOrders(tenantId: string, branchId: string, limitCount = 5): Promise<Order[]> {
  try {
    const ordersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/orders`)
    const ordersQuery = firestoreQuery(ordersCollection, orderBy("createdAt", "desc"), limit(limitCount))

    const snapshot = await getDocs(ordersQuery)

    if (snapshot.empty) {
      console.log("No recent orders found in Firestore")
      return []
    }

    const orders = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Order
    })

    console.log(`Found ${orders.length} recent orders in Firestore`)
    return orders
  } catch (error) {
    console.error("Error fetching recent orders from Firestore:", error)
    return []
  }
}

// Función para crear un nuevo pedido
export async function createOrder(tenantId: string, branchId: string, orderData: OrderFormData): Promise<Order> {
  try {
    // Intentamos primero con Firestore
    const ordersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/orders`)

    // Calcular subtotal, impuestos y total
    let subtotal = 0
    for (const item of orderData.items) {
      subtotal += item.price * item.quantity
    }

    const taxRate = 0.1 // 10% de impuesto
    const tax = subtotal * taxRate
    const deliveryFee = orderData.type === "delivery" ? 5.0 : 0 // Cuota de envío de $5 para delivery
    const total = subtotal + tax + deliveryFee

    // Generar un número de pedido único
    const orderNumber = `ORD-${Date.now()}`

    const newOrder = {
      ...orderData,
      orderNumber,
      subtotal,
      tax,
      deliveryFee,
      total,
      status: "new" as OrderStatus,
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      branchId,
    }

    const docRef = await addDoc(ordersCollection, newOrder)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error("Failed to create order in Firestore")
    }

    const createdOrder = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Order

    console.log("Order created in Firestore with ID:", docSnap.id)
    return createdOrder
  } catch (error) {
    console.error("Error creating order in Firestore:", error)
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
    console.log(`Updating order ${orderId} status to ${status}`)
    const orderRef = doc(db, `tenants/${tenantId}/branches/${branchId}/orders`, orderId)

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    console.log(`Order ${orderId} status updated to ${status}`)
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error)
    throw error
  }
}

// Función para obtener mesas disponibles
export async function getAvailableTables(tenantId: string, branchId: string): Promise<string[]> {
  try {
    // En una implementación real, consultaríamos las mesas ocupadas y disponibles
    // Por ahora, devolvemos una lista estática de mesas
    console.log(`Fetching available tables for tenant ${tenantId}, branch ${branchId}`)
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
  } catch (error) {
    console.error("Error fetching available tables:", error)
    return []
  }
}

// Función para crear pedidos de ejemplo
export async function createSampleOrders(tenantId: string, branchId: string): Promise<void> {
  try {
    console.log(`Creating sample orders for tenant ${tenantId}, branch ${branchId}`)

    const sampleOrders: Omit<Order, "id" | "createdAt" | "updatedAt">[] = [
      // Pedido de mesa
      {
        orderNumber: `ORD-${Date.now()}-1`,
        type: "dine_in",
        status: "new",
        items: [
          {
            id: "item1",
            productId: "prod1",
            productName: "Hamburguesa Clásica",
            quantity: 2,
            price: 8.99,
            subtotal: 17.98,
          },
          {
            id: "item2",
            productId: "prod2",
            productName: "Papas Fritas",
            quantity: 1,
            price: 3.99,
            subtotal: 3.99,
          },
          {
            id: "item3",
            productId: "prod3",
            productName: "Refresco Cola",
            quantity: 2,
            price: 1.99,
            subtotal: 3.98,
          },
        ],
        customer: {
          name: "Cliente Mesa",
        },
        tableNumber: "3",
        subtotal: 25.95,
        tax: 2.6,
        total: 28.55,
        paymentMethod: "cash",
        paymentStatus: "pending",
        notes: "Sin cebolla en las hamburguesas",
        branchId,
      },

      // Pedido para llevar
      {
        orderNumber: `ORD-${Date.now()}-2`,
        type: "takeaway",
        status: "preparing",
        items: [
          {
            id: "item1",
            productId: "prod4",
            productName: "Pizza Margherita",
            quantity: 1,
            price: 12.99,
            subtotal: 12.99,
          },
          {
            id: "item2",
            productId: "prod5",
            productName: "Alitas de Pollo",
            quantity: 1,
            price: 7.99,
            subtotal: 7.99,
          },
        ],
        customer: {
          name: "Juan Pérez",
          phone: "555-123-4567",
        },
        subtotal: 20.98,
        tax: 2.1,
        total: 23.08,
        paymentMethod: "card",
        paymentStatus: "paid",
        notes: "Alitas extra picantes",
        branchId,
      },

      // Pedido delivery
      {
        orderNumber: `ORD-${Date.now()}-3`,
        type: "delivery",
        status: "in_transit",
        items: [
          {
            id: "item1",
            productId: "prod6",
            productName: "Ensalada César",
            quantity: 1,
            price: 9.99,
            subtotal: 9.99,
          },
          {
            id: "item2",
            productId: "prod7",
            productName: "Pasta Alfredo",
            quantity: 1,
            price: 11.99,
            subtotal: 11.99,
          },
          {
            id: "item3",
            productId: "prod8",
            productName: "Tiramisú",
            quantity: 1,
            price: 6.99,
            subtotal: 6.99,
          },
        ],
        customer: {
          name: "María González",
          phone: "555-987-6543",
          email: "maria@example.com",
          address: "Calle Principal 123, Ciudad",
        },
        subtotal: 28.97,
        tax: 2.9,
        deliveryFee: 5.0,
        total: 36.87,
        paymentMethod: "online",
        paymentStatus: "paid",
        notes: "Timbre no funciona, llamar al llegar",
        branchId,
      },
    ]

    const ordersCollection = collection(db, `tenants/${tenantId}/branches/${branchId}/orders`)

    // Crear cada pedido de ejemplo
    for (const order of sampleOrders) {
      await addDoc(ordersCollection, {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    console.log(`Created ${sampleOrders.length} sample orders`)
  } catch (error) {
    console.error("Error creating sample orders:", error)
    throw error
  }
}
