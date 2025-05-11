import { db } from "../firebase/admin"
import type { Order, OrderStatus, OrderType } from "../types/order"

export class OrderService {
  private collection = "orders"

  async getOrders(tenantId: string, branchId: string): Promise<Order[]> {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("tenantId", "==", tenantId)
        .where("branchId", "==", branchId)
        .orderBy("createdAt", "desc")
        .get()

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Order,
      )
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  }

  async getOrdersByStatus(tenantId: string, branchId: string, statuses: OrderStatus[]): Promise<Order[]> {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("tenantId", "==", tenantId)
        .where("branchId", "==", branchId)
        .where("status", "in", statuses)
        .orderBy("createdAt", "desc")
        .get()

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Order,
      )
    } catch (error) {
      console.error("Error fetching orders by status:", error)
      throw error
    }
  }

  async getOrdersByType(tenantId: string, branchId: string, types: OrderType[]): Promise<Order[]> {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("tenantId", "==", tenantId)
        .where("branchId", "==", branchId)
        .where("orderType", "in", types)
        .orderBy("createdAt", "desc")
        .get()

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Order,
      )
    } catch (error) {
      console.error("Error fetching orders by type:", error)
      throw error
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const doc = await db.collection(this.collection).doc(orderId).get()

      if (!doc.exists) {
        return null
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as Order
    } catch (error) {
      console.error("Error fetching order:", error)
      throw error
    }
  }

  async createOrder(order: Omit<Order, "id">): Promise<Order> {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber()

      const orderWithNumber = {
        ...order,
        orderNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await db.collection(this.collection).add(orderWithNumber)

      return {
        id: docRef.id,
        ...orderWithNumber,
      } as Order
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const updates: any = {
        status,
        updatedAt: new Date(),
      }

      // If status is completed, add completedAt timestamp
      if (status === "completed" || status === "delivered") {
        updates.completedAt = new Date()
      }

      await db.collection(this.collection).doc(orderId).update(updates)
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      await db
        .collection(this.collection)
        .doc(orderId)
        .update({
          ...updates,
          updatedAt: new Date(),
        })
    } catch (error) {
      console.error("Error updating order:", error)
      throw error
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      await db.collection(this.collection).doc(orderId).delete()
    } catch (error) {
      console.error("Error deleting order:", error)
      throw error
    }
  }

  private generateOrderNumber(): string {
    // Generate a random 6-digit order number
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    return `ORD-${randomNum}`
  }
}

export const orderService = new OrderService()
