import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import type { Order, OrderFormData, OrderStatus, OrderType } from "@/lib/types/order"

export const getOrders = async (tenantId: string, branchId: string, type?: OrderType): Promise<Order[]> => {
  try {
    let ordersQuery = query(
      collection(db, `tenants/${tenantId}/branches/${branchId}/orders`),
      orderBy("createdAt", "desc"),
    )

    if (type) {
      ordersQuery = query(
        collection(db, `tenants/${tenantId}/branches/${branchId}/orders`),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      )
    }

    const snapshot = await getDocs(ordersQuery)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as Order
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export const getOrderById = async (tenantId: string, branchId: string, orderId: string): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, `tenants/${tenantId}/branches/${branchId}/orders`, orderId))

    if (!orderDoc.exists()) {
      return null
    }

    const data = orderDoc.data()
    return {
      id: orderDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Order
  } catch (error) {
    console.error("Error fetching order:", error)
    throw error
  }
}

export const createOrder = async (tenantId: string, branchId: string, orderData: OrderFormData): Promise<string> => {
  try {
    // Calculate subtotals for each item
    const items = orderData.items.map((item) => {
      const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0
      const subtotal = item.price * item.quantity + extrasTotal * item.quantity

      return {
        ...item,
        id: Math.random().toString(36).substring(2, 15),
        subtotal,
      }
    })

    // Calculate order totals
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = subtotal * 0.1 // Assuming 10% tax
    const deliveryFee = orderData.type === "delivery" ? 5 : 0 // Example delivery fee
    const total = subtotal + tax + deliveryFee

    // Generate order number (simple implementation)
    const timestamp = Date.now()
    const randomDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const orderNumber = `ORD-${timestamp.toString().slice(-6)}-${randomDigits}`

    const newOrder = {
      orderNumber,
      type: orderData.type,
      status: "new" as OrderStatus,
      items,
      subtotal,
      tax,
      deliveryFee: orderData.type === "delivery" ? deliveryFee : undefined,
      total,
      tableNumber: orderData.tableNumber,
      customer: orderData.customer,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "pending",
      notes: orderData.notes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      branchId,
    }

    const docRef = await addDoc(collection(db, `tenants/${tenantId}/branches/${branchId}/orders`), newOrder)
    return docRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export const updateOrderStatus = async (
  tenantId: string,
  branchId: string,
  orderId: string,
  status: OrderStatus,
): Promise<void> => {
  try {
    const orderRef = doc(db, `tenants/${tenantId}/branches/${branchId}/orders`, orderId)

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

export const getAvailableTables = async (tenantId: string, branchId: string): Promise<string[]> => {
  // This would typically fetch from your database
  // For now, returning a static list of tables
  return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
}

export const getOrderStatusOptions = (type: OrderType): OrderStatus[] => {
  const commonStatuses: OrderStatus[] = ["new", "received", "preparing", "ready", "completed", "cancelled"]

  if (type === "delivery") {
    return [...commonStatuses, "in_transit", "delivered"]
  }

  return commonStatuses
}

export const getNextStatus = (currentStatus: OrderStatus, type: OrderType): OrderStatus | null => {
  const statusFlow: Record<OrderStatus, OrderStatus> = {
    new: "received",
    received: "preparing",
    preparing: "ready",
    ready: type === "delivery" ? "in_transit" : "completed",
    in_transit: "delivered",
    delivered: "completed",
    completed: "completed", // Terminal state
    cancelled: "cancelled", // Terminal state
  }

  return statusFlow[currentStatus] || null
}
