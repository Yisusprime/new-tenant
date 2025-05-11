import { db } from "../firebase/admin"
import { OrderStatus, type OrderType } from "../types/order"

export class OrderService {
  // Obtener todos los pedidos
  static async getAllOrders(tenantId: string, branchId: string) {
    try {
      const ordersRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .orderBy("createdAt", "desc")

      const snapshot = await ordersRef.get()
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error al obtener pedidos:", error)
      throw new Error("No se pudieron obtener los pedidos")
    }
  }

  // Obtener pedidos por tipo
  static async getOrdersByType(tenantId: string, branchId: string, type: OrderType) {
    try {
      // Primero verificamos si hay algún pedido de este tipo
      const countQuery = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .where("type", "==", type)
        .limit(1)

      const countSnapshot = await countQuery.get()

      // Si no hay pedidos de este tipo, devolvemos un array vacío
      if (countSnapshot.empty) {
        return []
      }

      // Si hay pedidos, hacemos la consulta completa con ordenamiento
      const ordersRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .where("type", "==", type)
        .orderBy("createdAt", "desc")

      const snapshot = await ordersRef.get()
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Error al obtener pedidos de tipo ${type}:`, error)
      // Si el error es por falta de índice, sugerimos crear el índice
      if (error.message?.includes("index")) {
        throw new Error(
          `Se requiere un índice para esta consulta. Por favor, haz clic en el enlace proporcionado en el mensaje de error para crearlo.`,
        )
      }
      throw new Error(`No se pudieron obtener los pedidos de tipo ${type}`)
    }
  }

  // Obtener pedidos por estado
  static async getOrdersByStatus(tenantId: string, branchId: string, status: OrderStatus) {
    try {
      const ordersRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")

      const snapshot = await ordersRef.get()
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Error al obtener pedidos con estado ${status}:`, error)
      throw new Error(`No se pudieron obtener los pedidos con estado ${status}`)
    }
  }

  // Obtener un pedido por ID
  static async getOrderById(tenantId: string, branchId: string, orderId: string) {
    try {
      const orderRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .doc(orderId)

      const doc = await orderRef.get()
      if (!doc.exists) {
        throw new Error(`El pedido con ID ${orderId} no existe`)
      }

      return {
        id: doc.id,
        ...doc.data(),
      }
    } catch (error) {
      console.error(`Error al obtener pedido ${orderId}:`, error)
      throw new Error(`No se pudo obtener el pedido ${orderId}`)
    }
  }

  // Crear un nuevo pedido
  static async createOrder(tenantId: string, branchId: string, orderData: any) {
    try {
      // Generar un número de pedido único
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`

      const orderWithMetadata = {
        ...orderData,
        orderNumber,
        tenantId,
        branchId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: OrderStatus.PENDING,
      }

      const orderRef = db.collection("tenants").doc(tenantId).collection("branches").doc(branchId).collection("orders")

      const docRef = await orderRef.add(orderWithMetadata)

      return {
        id: docRef.id,
        ...orderWithMetadata,
      }
    } catch (error) {
      console.error("Error al crear pedido:", error)
      throw new Error("No se pudo crear el pedido")
    }
  }

  // Actualizar el estado de un pedido
  static async updateOrderStatus(tenantId: string, branchId: string, orderId: string, status: OrderStatus) {
    try {
      const orderRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .doc(orderId)

      await orderRef.update({
        status,
        updatedAt: new Date(),
        ...(status === OrderStatus.COMPLETED ? { completedAt: new Date() } : {}),
      })

      return true
    } catch (error) {
      console.error(`Error al actualizar estado del pedido ${orderId}:`, error)
      throw new Error(`No se pudo actualizar el estado del pedido ${orderId}`)
    }
  }

  // Actualizar un pedido
  static async updateOrder(tenantId: string, branchId: string, orderId: string, updates: any) {
    try {
      const orderRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .doc(orderId)

      await orderRef.update({
        ...updates,
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error(`Error al actualizar pedido ${orderId}:`, error)
      throw new Error(`No se pudo actualizar el pedido ${orderId}`)
    }
  }

  // Eliminar un pedido
  static async deleteOrder(tenantId: string, branchId: string, orderId: string) {
    try {
      const orderRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("orders")
        .doc(orderId)

      await orderRef.delete()

      return true
    } catch (error) {
      console.error(`Error al eliminar pedido ${orderId}:`, error)
      throw new Error(`No se pudo eliminar el pedido ${orderId}`)
    }
  }

  // Obtener todas las mesas
  static async getTables(tenantId: string, branchId: string) {
    try {
      const tablesRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("tables")
        .orderBy("number", "asc")

      const snapshot = await tablesRef.get()
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error al obtener mesas:", error)
      throw new Error("No se pudieron obtener las mesas")
    }
  }

  // Crear una nueva mesa
  static async createTable(tenantId: string, branchId: string, tableData: any) {
    try {
      const tableWithMetadata = {
        ...tableData,
        isOccupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const tableRef = db.collection("tenants").doc(tenantId).collection("branches").doc(branchId).collection("tables")

      const docRef = await tableRef.add(tableWithMetadata)

      return {
        id: docRef.id,
        ...tableWithMetadata,
      }
    } catch (error) {
      console.error("Error al crear mesa:", error)
      throw new Error("No se pudo crear la mesa")
    }
  }

  // Actualizar una mesa
  static async updateTable(tenantId: string, branchId: string, tableId: string, updates: any) {
    try {
      const tableRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("tables")
        .doc(tableId)

      await tableRef.update({
        ...updates,
        updatedAt: new Date(),
      })

      return true
    } catch (error) {
      console.error(`Error al actualizar mesa ${tableId}:`, error)
      throw new Error(`No se pudo actualizar la mesa ${tableId}`)
    }
  }

  // Eliminar una mesa
  static async deleteTable(tenantId: string, branchId: string, tableId: string) {
    try {
      // Primero verificamos si la mesa está ocupada
      const tableRef = db
        .collection("tenants")
        .doc(tenantId)
        .collection("branches")
        .doc(branchId)
        .collection("tables")
        .doc(tableId)

      const tableDoc = await tableRef.get()
      if (tableDoc.exists && tableDoc.data()?.isOccupied) {
        throw new Error("No se puede eliminar una mesa ocupada")
      }

      await tableRef.delete()

      return true
    } catch (error) {
      console.error(`Error al eliminar mesa ${tableId}:`, error)
      throw new Error(`No se pudo eliminar la mesa ${tableId}`)
    }
  }
}

// Exportar el servicio
