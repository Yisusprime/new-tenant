"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ref, push, get, update, remove, set } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import type { Order } from "@/lib/types/orders"

interface OrderContextProps {
  orders: Order[]
  loading: boolean
  error: string | null
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => Promise<string>
  updateOrder: (id: string, order: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  getOrder: (id: string) => Promise<Order | null>
  refreshOrders: () => Promise<void>
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

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log("Fetching orders for tenant:", tenantId)

      if (!tenantId) {
        console.error("No tenantId provided to OrderProvider")
        setError("Error: No se proporcionó un ID de inquilino")
        setLoading(false)
        return
      }

      // Usar Realtime Database en lugar de Firestore
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      console.log(`Ruta de órdenes: tenants/${tenantId}/orders`)

      const ordersSnapshot = await get(ordersRef)
      const ordersData = ordersSnapshot.val() || {}

      console.log("Datos de órdenes cargados:", ordersData)

      const fetchedOrders: Order[] = Object.keys(ordersData).map((key) => ({
        id: key,
        ...ordersData[key],
      }))

      // Ordenar las órdenes por fecha de creación (más recientes primero)
      fetchedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

      console.log("Fetched orders:", fetchedOrders.length)
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
    } else {
      setLoading(false)
      setError("No se proporcionó un ID de inquilino")
    }
  }, [tenantId])

  const addOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">) => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Añadiendo pedido para el tenant: ${tenantId}`)

      // Usar Realtime Database en lugar de Firestore
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const newOrderRef = push(ordersRef)

      // Generar número de orden
      const timestamp = Date.now()
      const randomPart = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const orderNumber = `ORD-${timestamp.toString().slice(-6)}-${randomPart}`

      // Crear una copia del objeto y eliminar propiedades undefined
      const cleanedOrderData = { ...orderData }
      Object.keys(cleanedOrderData).forEach((key) => {
        if (cleanedOrderData[key] === undefined) {
          delete cleanedOrderData[key]
        }
      })

      const newOrder = {
        ...cleanedOrderData,
        orderNumber,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      await set(newOrderRef, newOrder)
      await fetchOrders()
      return newOrderRef.key || ""
    } catch (err) {
      console.error("Error adding order:", err)
      setError("Error al añadir el pedido")
      throw err
    }
  }

  const updateOrder = async (id: string, orderData: Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>) => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Actualizando pedido para el tenant: ${tenantId}`)

      // Usar Realtime Database en lugar de Firestore
      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${id}`)

      // Obtener datos actuales para no sobrescribir campos que no se están actualizando
      const currentOrderSnapshot = await get(orderRef)
      const currentOrder = currentOrderSnapshot.val() || {}

      await update(orderRef, {
        ...currentOrder,
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
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Eliminando pedido para el tenant: ${tenantId}`)

      // Usar Realtime Database en lugar de Firestore
      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${id}`)
      await remove(orderRef)

      await fetchOrders()
    } catch (err) {
      console.error("Error deleting order:", err)
      setError("Error al eliminar el pedido")
      throw err
    }
  }

  const getOrder = async (id: string): Promise<Order | null> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      // Usar Realtime Database en lugar de Firestore
      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${id}`)
      const orderSnapshot = await get(orderRef)

      if (orderSnapshot.exists()) {
        return {
          id,
          ...orderSnapshot.val(),
        } as Order
      }

      return null
    } catch (err) {
      console.error("Error getting order:", err)
      setError("Error al obtener el pedido")
      throw err
    }
  }

  const value = {
    orders,
    loading,
    error,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    refreshOrders: fetchOrders,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
