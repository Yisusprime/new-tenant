import { db } from "../../lib/firebase/admin"
import { OrderStatus, type OrderType } from "../types/order"
import { serverTimestamp } from "firebase-admin/firestore"

// Función para obtener todos los pedidos
const getAllOrders = async (tenantId: string, branchId: string) => {
  try {
    const ordersRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .orderBy("createdAt", "desc")

    const snapshot = await ordersRef.get()

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
    }))
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    throw error
  }
}

// Función para obtener pedidos por tipo
const getOrdersByType = async (tenantId: string, branchId: string, type: OrderType) => {
  try {
    const ordersRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .where("type", "==", type)
      .orderBy("createdAt", "desc")

    const snapshot = await ordersRef.get()

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
    }))
  } catch (error) {
    console.error(`Error al obtener pedidos de tipo ${type}:`, error)
    throw error
  }
}

// Función para obtener pedidos por estado
const getOrdersByStatus = async (tenantId: string, branchId: string, status: OrderStatus) => {
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

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
      updatedAt: doc.data().updatedAt ? doc.data().updatedAt.toDate() : new Date(),
    }))
  } catch (error) {
    console.error(`Error al obtener pedidos con estado ${status}:`, error)
    throw error
  }
}

// Función para obtener un pedido por ID
const getOrderById = async (tenantId: string, branchId: string, orderId: string) => {
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
      throw new Error(`Pedido con ID ${orderId} no encontrado`)
    }

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt ? doc.data()?.createdAt.toDate() : new Date(),
      updatedAt: doc.data()?.updatedAt ? doc.data()?.updatedAt.toDate() : new Date(),
    }
  } catch (error) {
    console.error(`Error al obtener pedido ${orderId}:`, error)
    throw error
  }
}

// Función para crear un nuevo pedido
const createOrder = async (tenantId: string, branchId: string, orderData: any) => {
  try {
    const orderRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("orders")
      .doc()

    const now = serverTimestamp()

    const newOrder = {
      ...orderData,
      status: orderData.status || OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    }

    await orderRef.set(newOrder)

    return {
      id: orderRef.id,
      ...newOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  } catch (error) {
    console.error("Error al crear pedido:", error)
    throw error
  }
}

// Función para actualizar el estado de un pedido
const updateOrderStatus = async (tenantId: string, branchId: string, orderId: string, status: OrderStatus) => {
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
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error(`Error al actualizar estado del pedido ${orderId}:`, error)
    throw error
  }
}

// Función para actualizar un pedido
const updateOrder = async (tenantId: string, branchId: string, orderId: string, updates: any) => {
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
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error(`Error al actualizar pedido ${orderId}:`, error)
    throw error
  }
}

// Función para eliminar un pedido
const deleteOrder = async (tenantId: string, branchId: string, orderId: string) => {
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
    throw error
  }
}

// Funciones para gestión de mesas
const getTables = async (tenantId: string, branchId: string) => {
  try {
    const tablesRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("tables")
      .orderBy("number", "asc")

    const snapshot = await tablesRef.get()

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error al obtener mesas:", error)
    throw error
  }
}

const getAvailableTables = async (tenantId: string, branchId: string) => {
  try {
    const tablesRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("tables")
      .where("isOccupied", "==", false)
      .orderBy("number", "asc")

    const snapshot = await tablesRef.get()

    if (snapshot.empty) {
      return []
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error al obtener mesas disponibles:", error)
    throw error
  }
}

const createTable = async (tenantId: string, branchId: string, tableData: any) => {
  try {
    const tableRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("tables")
      .doc()

    const newTable = {
      ...tableData,
      isOccupied: false,
      currentOrderId: null,
      createdAt: serverTimestamp(),
    }

    await tableRef.set(newTable)

    return {
      id: tableRef.id,
      ...newTable,
    }
  } catch (error) {
    console.error("Error al crear mesa:", error)
    throw error
  }
}

const updateTable = async (tenantId: string, branchId: string, tableId: string, updates: any) => {
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
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error(`Error al actualizar mesa ${tableId}:`, error)
    throw error
  }
}

const deleteTable = async (tenantId: string, branchId: string, tableId: string) => {
  try {
    const tableRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("branches")
      .doc(branchId)
      .collection("tables")
      .doc(tableId)

    await tableRef.delete()

    return true
  } catch (error) {
    console.error(`Error al eliminar mesa ${tableId}:`, error)
    throw error
  }
}

export const OrderService = {
  getAllOrders,
  getOrdersByType,
  getOrdersByStatus,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  getTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable,
}
