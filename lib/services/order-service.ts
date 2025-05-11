import { db } from "@/lib/firebase/client"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore"
import type { Order, OrderStatus, OrderSummary, OrderType } from "@/lib/types/order"

export interface TableInfo {
  id: string
  name: string
  capacity: number
  location?: string
}

export class OrderService {
  private tenantId: string
  private branchId: string

  constructor(tenantId: string, branchId: string) {
    this.tenantId = tenantId
    this.branchId = branchId
  }

  // Obtener todos los pedidos
  async getOrders(): Promise<OrderSummary[]> {
    try {
      const ordersRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`)
      const q = query(ordersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          orderNumber: data.orderNumber,
          type: data.type,
          status: data.status,
          total: data.total,
          customerName: data.customer.name,
          createdAt: data.createdAt.toDate(),
          tableInfo: data.tableInfo,
        }
      })
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      throw error
    }
  }

  // Obtener pedidos por tipo
  async getOrdersByType(type: OrderType): Promise<OrderSummary[]> {
    try {
      const ordersRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`)
      const q = query(ordersRef, where("type", "==", type), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          orderNumber: data.orderNumber,
          type: data.type,
          status: data.status,
          total: data.total,
          customerName: data.customer.name,
          createdAt: data.createdAt.toDate(),
          tableInfo: data.tableInfo,
        }
      })
    } catch (error) {
      console.error(`Error al obtener pedidos de tipo ${type}:`, error)
      throw error
    }
  }

  // Obtener pedidos por estado
  async getOrdersByStatus(status: OrderStatus): Promise<OrderSummary[]> {
    try {
      const ordersRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`)
      const q = query(ordersRef, where("status", "==", status), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          orderNumber: data.orderNumber,
          type: data.type,
          status: data.status,
          total: data.total,
          customerName: data.customer.name,
          createdAt: data.createdAt.toDate(),
          tableInfo: data.tableInfo,
        }
      })
    } catch (error) {
      console.error(`Error al obtener pedidos con estado ${status}:`, error)
      throw error
    }
  }

  // Obtener un pedido por ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`, orderId)
      const orderDoc = await getDoc(orderRef)

      if (!orderDoc.exists()) {
        return null
      }

      const data = orderDoc.data()
      return {
        ...data,
        id: orderDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        estimatedDeliveryTime: data.estimatedDeliveryTime ? data.estimatedDeliveryTime.toDate() : undefined,
        completedAt: data.completedAt ? data.completedAt.toDate() : undefined,
      } as Order
    } catch (error) {
      console.error(`Error al obtener pedido con ID ${orderId}:`, error)
      throw error
    }
  }

  // Crear un nuevo pedido
  async createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      // Generar número de pedido (formato: YYYYMMDD-XXX)
      const today = new Date()
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")

      // Obtener el último número de pedido del día
      const ordersRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`)
      const q = query(
        ordersRef,
        where("orderNumber", ">=", `${dateStr}-`),
        where("orderNumber", "<", `${dateStr}-\uf8ff`),
        orderBy("orderNumber", "desc"),
      )

      const querySnapshot = await getDocs(q)
      let orderNumber = `${dateStr}-001`

      if (!querySnapshot.empty) {
        const lastOrderNumber = querySnapshot.docs[0].data().orderNumber
        const lastNumber = Number.parseInt(lastOrderNumber.split("-")[1])
        orderNumber = `${dateStr}-${(lastNumber + 1).toString().padStart(3, "0")}`
      }

      const newOrder = {
        ...order,
        orderNumber,
        tenantId: this.tenantId,
        branchId: this.branchId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`), newOrder)
      return docRef.id
    } catch (error) {
      console.error("Error al crear pedido:", error)
      throw error
    }
  }

  // Actualizar estado de un pedido
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`, orderId)

      const updates: any = {
        status,
        updatedAt: serverTimestamp(),
      }

      // Si el estado es completado, agregar la fecha de completado
      if (status === "completed") {
        updates.completedAt = serverTimestamp()
      }

      await updateDoc(orderRef, updates)
    } catch (error) {
      console.error(`Error al actualizar estado del pedido ${orderId}:`, error)
      throw error
    }
  }

  // Actualizar un pedido
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      const orderRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`, orderId)

      await updateDoc(orderRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error al actualizar pedido ${orderId}:`, error)
      throw error
    }
  }

  // Eliminar un pedido
  async deleteOrder(orderId: string): Promise<void> {
    try {
      const orderRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`, orderId)
      await deleteDoc(orderRef)
    } catch (error) {
      console.error(`Error al eliminar pedido ${orderId}:`, error)
      throw error
    }
  }

  // Obtener mesas disponibles
  async getAvailableTables(): Promise<TableInfo[]> {
    try {
      // Primero obtenemos todas las mesas
      const tablesRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/tables`)
      const tablesSnapshot = await getDocs(tablesRef)

      const allTables = tablesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TableInfo[]

      // Luego obtenemos las mesas ocupadas (pedidos activos de tipo mesa)
      const ordersRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/orders`)
      const q = query(ordersRef, where("type", "==", "table"), where("status", "in", ["pending", "preparing", "ready"]))

      const ordersSnapshot = await getDocs(q)
      const occupiedTableIds = ordersSnapshot.docs.map((doc) => doc.data().tableInfo?.id).filter(Boolean)

      // Filtramos las mesas disponibles
      return allTables.filter((table) => !occupiedTableIds.includes(table.id))
    } catch (error) {
      console.error("Error al obtener mesas disponibles:", error)
      throw error
    }
  }

  // Obtener todas las mesas
  async getAllTables(): Promise<TableInfo[]> {
    try {
      const tablesRef = collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/tables`)
      const tablesSnapshot = await getDocs(tablesRef)

      return tablesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TableInfo[]
    } catch (error) {
      console.error("Error al obtener todas las mesas:", error)
      throw error
    }
  }

  // Crear una nueva mesa
  async createTable(table: Omit<TableInfo, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, `tenants/${this.tenantId}/branches/${this.branchId}/tables`), table)
      return docRef.id
    } catch (error) {
      console.error("Error al crear mesa:", error)
      throw error
    }
  }

  // Actualizar una mesa
  async updateTable(tableId: string, updates: Partial<TableInfo>): Promise<void> {
    try {
      const tableRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/tables`, tableId)
      await updateDoc(tableRef, updates)
    } catch (error) {
      console.error(`Error al actualizar mesa ${tableId}:`, error)
      throw error
    }
  }

  // Eliminar una mesa
  async deleteTable(tableId: string): Promise<void> {
    try {
      const tableRef = doc(db, `tenants/${this.tenantId}/branches/${this.branchId}/tables`, tableId)
      await deleteDoc(tableRef)
    } catch (error) {
      console.error(`Error al eliminar mesa ${tableId}:`, error)
      throw error
    }
  }
}
