"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type { Order, OrderStatus, OrderType } from "@/lib/types/orders"

interface OrderContextProps {
  orders: Order[]
  loading: boolean
  error: string | null
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => Promise<string>
  updateOrder: (
    id: string,
    order: Partial<Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">>,
  ) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  getOrder: (id: string) => Promise<Order | null>
  refreshOrders: () => Promise<void>
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getOrdersByType: (type: OrderType) => Order[]
  getOrdersByTable: (tableId: string) => Order[]
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
  completeOrder: (id: string) => Promise<void>
  cancelOrder: (id: string) => Promise<void>
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined)

export const useOrderContext = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider")
  }
  return context
}

interface OrderProviderProps {
  children: ReactNode
  tenantId: string
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children, tenantId }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const ordersCollectionRef = collection(db, `tenants/${tenantId}/orders`)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const q = query(ordersCollectionRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const fetchedOrders: Order[] = []
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order)
      })

      setOrders(fetchedOrders)
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchOrders()
    }
  }, [tenantId])

  const generateOrderNumber = async (): Promise<string> => {
    const today = new Date()
    const year = today.getFullYear().toString().slice(-2)
    const month = (today.getMonth() + 1).toString().padStart(2, "0")
    const day = today.getDate().toString().padStart(2, "0")

    // Get count of orders for today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const endOfDay = startOfDay + 86400000 // Add 24 hours in milliseconds

    const q = query(ordersCollectionRef, where("createdAt", ">=", startOfDay), where("createdAt", "<", endOfDay))

    const querySnapshot = await getDocs(q)
    const orderCount = querySnapshot.size + 1

    return `${year}${month}${day}-${orderCount.toString().padStart(3, "0")}`
  }

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => {
    try {
      const timestamp = Date.now()
      const orderNumber = await generateOrderNumber()

      const newOrder = {
        ...orderData,
        orderNumber,
        tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const docRef = await addDoc(ordersCollectionRef, newOrder)
      await fetchOrders()
      return docRef.id
    } catch (err) {
      console.error("Error adding order:", err)
      setError("Error al añadir el pedido")
      throw err
    }
  }

  const updateOrder = async (
    id: string,
    orderData: Partial<Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">>,
  ) => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: Date.now(),
      })
      await fetchOrders()
    } catch (err) {
      console.error("Error updating order:", err)
      setError("Error al actualizar el pedido")
      throw err
    }
  }

  const deleteOrder = async (id: string) => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      await deleteDoc(orderRef)
      await fetchOrders()
    } catch (err) {
      console.error("Error deleting order:", err)
      setError("Error al eliminar el pedido")
      throw err
    }
  }

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      const orderDoc = await getDoc(orderRef)

      if (orderDoc.exists()) {
        return { id: orderDoc.id, ...orderDoc.data() } as Order
      }

      return null
    } catch (err) {
      console.error("Error getting order:", err)
      setError("Error al obtener el pedido")
      throw err
    }
  }

  const getOrdersByStatus = (status: OrderStatus): Order[] => {
    return orders.filter((order) => order.status === status)
  }

  const getOrdersByType = (type: OrderType): Order[] => {
    return orders.filter((order) => order.type === type)
  }

  const getOrdersByTable = (tableId: string): Order[] => {
    return orders.filter(
      (order) => order.tableId === tableId && order.status !== "completed" && order.status !== "cancelled",
    )
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      await updateDoc(orderRef, {
        status,
        updatedAt: Date.now(),
      })
      await fetchOrders()
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Error al actualizar el estado del pedido")
      throw err
    }
  }

  const completeOrder = async (id: string) => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      await updateDoc(orderRef, {
        status: "completed",
        completedAt: Date.now(),
        updatedAt: Date.now(),
      })
      await fetchOrders()
    } catch (err) {
      console.error("Error completing order:", err)
      setError("Error al completar el pedido")
      throw err
    }
  }

  const cancelOrder = async (id: string) => {
    try {
      const orderRef = doc(db, `tenants/${tenantId}/orders/${id}`)
      await updateDoc(orderRef, {
        status: "cancelled",
        updatedAt: Date.now(),
      })
      await fetchOrders()
    } catch (err) {
      console.error("Error cancelling order:", err)
      setError("Error al cancelar el pedido")
      throw err
    }
  }

  const refreshOrders = fetchOrders

  const value = {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    refreshOrders,
    getOrdersByStatus,
    getOrdersByType,
    getOrdersByTable,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
