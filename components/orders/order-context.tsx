"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import type { Order, OrderStatus } from "@/lib/types/orders"

interface OrderContextProps {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  addOrder: (orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  completeOrder: (orderId: string) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  deleteOrder: (orderId: string) => Promise<void>
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined)

export const OrderProvider: React.FC<{ children: React.ReactNode; tenantId: string }> = ({ children, tenantId }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const ordersRef = collection(db, `tenants/${tenantId}/orders`)
      const q = query(ordersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const ordersData: Order[] = []
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order)
      })

      setOrders(ordersData)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  // Cargar pedidos al inicializar
  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => {
    try {
      setLoading(true)

      // Generar número de orden
      const timestamp = Date.now()
      const randomDigits = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const orderNumber = `${timestamp.toString().slice(-6)}${randomDigits}`

      const newOrder = {
        ...orderData,
        orderNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, `tenants/${tenantId}/orders`), newOrder)

      // Actualizar la lista de pedidos
      await fetchOrders()

      return docRef.id
    } catch (err) {
      console.error("Error adding order:", err)
      setError("Error al crear el pedido")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      setLoading(true)

      const orderRef = doc(db, `tenants/${tenantId}/orders`, orderId)
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      })

      // Actualizar la lista de pedidos
      await fetchOrders()
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Error al actualizar el estado del pedido")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const completeOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "completed")
  }

  const cancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, "cancelled")
  }

  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true)

      const orderRef = doc(db, `tenants/${tenantId}/orders`, orderId)
      await deleteDoc(orderRef)

      // Actualizar la lista de pedidos
      await fetchOrders()
    } catch (err) {
      console.error("Error deleting order:", err)
      setError("Error al eliminar el pedido")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        addOrder,
        updateOrderStatus,
        completeOrder,
        cancelOrder,
        deleteOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export const useOrderContext = () => {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrderContext must be used within an OrderProvider")
  }
  return context
}
