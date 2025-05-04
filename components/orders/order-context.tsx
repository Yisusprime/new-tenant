"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { ref, push, get, update, onValue, off } from "firebase/database"
import { rtdb } from "@/lib/firebase-config"
import type { Order, OrderStatus } from "@/lib/types/orders"
import { useShift } from "./shift-provider"

interface OrderContextType {
  orders: Order[]
  loading: boolean
  error: string | null
  createOrder: (orderData: Partial<Order>) => Promise<string>
  updateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  completeOrder: (orderId: string) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  getOrder: (orderId: string) => Promise<Order | null>
  refreshOrders: () => Promise<void>
  updatingOrderIds: Record<string, boolean> // Añadido para rastrear órdenes en actualización
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

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
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Record<string, boolean>>({}) // Estado para rastrear órdenes en actualización
  const { currentShift } = useShift()

  // Usar suscripción en tiempo real para las órdenes
  useEffect(() => {
    if (!tenantId) {
      setLoading(false)
      setError("No se proporcionó un ID de inquilino")
      return
    }

    setLoading(true)
    console.log("Setting up real-time listener for orders, tenant:", tenantId)

    const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)

    const handleOrdersUpdate = (snapshot) => {
      try {
        const ordersData = snapshot.val() || {}
        console.log("Real-time orders data update received")

        const fetchedOrders: Order[] = Object.keys(ordersData).map((key) => ({
          id: key,
          ...ordersData[key],
        }))

        // Ordenar las órdenes por fecha de creación (más recientes primero)
        fetchedOrders.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt).getTime() : 0
          return dateB - dateA
        })

        setOrders(fetchedOrders)
        setError(null)
      } catch (err) {
        console.error("Error processing orders data:", err)
        setError("Error al procesar los datos de pedidos")
      } finally {
        setLoading(false)
      }
    }

    // Establecer el listener
    onValue(ordersRef, handleOrdersUpdate, (err) => {
      console.error("Error in orders listener:", err)
      setError("Error en la conexión con la base de datos")
      setLoading(false)
    })

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      console.log("Cleaning up orders listener")
      off(ordersRef)
    }
  }, [tenantId])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Manually fetching orders for tenant:", tenantId)

      if (!tenantId) {
        console.error("No tenantId provided to OrderProvider")
        setError("Error: No se proporcionó un ID de inquilino")
        setLoading(false)
        return
      }

      // Obtener todas las órdenes del inquilino
      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const ordersSnapshot = await get(ordersRef)
      const ordersData = ordersSnapshot.val() || {}

      console.log("Orders data loaded")

      const fetchedOrders: Order[] = Object.keys(ordersData).map((key) => ({
        id: key,
        ...ordersData[key],
      }))

      // Ordenar las órdenes por fecha de creación (más recientes primero)
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt).getTime() : 0
        return dateB - dateA
      })

      setOrders(fetchedOrders)
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  // Modificar la función createOrder para asegurarnos de que el shiftId se asigne correctamente

  // Reemplazar la función createOrder con esta versión mejorada:
  const createOrder = async (orderData: Partial<Order>): Promise<string> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Creating order for tenant: ${tenantId}`)

      const ordersRef = ref(rtdb, `tenants/${tenantId}/orders`)
      const newOrderRef = push(ordersRef)

      const timestamp = Date.now()

      // Asegurarnos de que el shiftId esté definido
      const shiftId = currentShift?.id || null
      console.log(`Assigning order to shift: ${shiftId}`)

      const newOrder: Omit<Order, "id"> = {
        tenantId,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: "pending",
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        tip: 0,
        total: 0,
        paymentStatus: "pending",
        paymentMethod: "cash",
        shiftId, // Asignar el turno actual
        ...orderData,
      }

      await update(newOrderRef, newOrder)
      console.log("New order created with ID:", newOrderRef.key)

      return newOrderRef.key || ""
    } catch (err) {
      console.error("Error creating order:", err)
      throw err
    }
  }

  const updateOrder = async (orderId: string, orderData: Partial<Order>): Promise<void> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Updating order ${orderId} for tenant: ${tenantId}`)

      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)
      await update(orderRef, orderData)
    } catch (err) {
      console.error("Error updating order:", err)
      throw err
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    try {
      // Marcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => ({ ...prev, [orderId]: true }))

      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Updating order ${orderId} status to ${status} for tenant: ${tenantId}`)

      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)
      const orderSnapshot = await get(orderRef)

      if (!orderSnapshot.exists()) {
        throw new Error("La orden no existe")
      }

      const orderData = orderSnapshot.val()

      // Verificar si el estado ya es el mismo para evitar actualizaciones innecesarias
      if (orderData.status === status) {
        console.log(`Order ${orderId} already has status ${status}`)
        return
      }

      const timestamp = Date.now()
      await update(orderRef, {
        status,
        updatedAt: timestamp,
        statusHistory: {
          ...(orderData.statusHistory || {}),
          [status]: timestamp,
        },
      })

      console.log(`Order ${orderId} status updated to ${status}`)
    } catch (err) {
      console.error("Error updating order status:", err)
      throw err
    } finally {
      // Desmarcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => {
        const newState = { ...prev }
        delete newState[orderId]
        return newState
      })
    }
  }

  const completeOrder = async (orderId: string): Promise<void> => {
    try {
      // Marcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => ({ ...prev, [orderId]: true }))

      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Completing order ${orderId} for tenant: ${tenantId}`)

      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)
      const orderSnapshot = await get(orderRef)

      if (!orderSnapshot.exists()) {
        throw new Error("La orden no existe")
      }

      const timestamp = Date.now()
      await update(orderRef, {
        status: "completed",
        completedAt: timestamp,
        updatedAt: timestamp,
        // Asegurarse de que la orden tenga asignado el turno actual
        shiftId: currentShift?.id || null,
      })

      console.log(`Order ${orderId} completed`)
    } catch (err) {
      console.error("Error completing order:", err)
      throw err
    } finally {
      // Desmarcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => {
        const newState = { ...prev }
        delete newState[orderId]
        return newState
      })
    }
  }

  const cancelOrder = async (orderId: string): Promise<void> => {
    try {
      // Marcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => ({ ...prev, [orderId]: true }))

      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      console.log(`Cancelling order ${orderId} for tenant: ${tenantId}`)

      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)
      const orderSnapshot = await get(orderRef)

      if (!orderSnapshot.exists()) {
        throw new Error("La orden no existe")
      }

      const timestamp = Date.now()
      await update(orderRef, {
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
        // Asegurarse de que la orden tenga asignado el turno actual
        shiftId: currentShift?.id || null,
      })

      console.log(`Order ${orderId} cancelled`)
    } catch (err) {
      console.error("Error cancelling order:", err)
      throw err
    } finally {
      // Desmarcar esta orden como "en actualización"
      setUpdatingOrderIds((prev) => {
        const newState = { ...prev }
        delete newState[orderId]
        return newState
      })
    }
  }

  const getOrder = async (orderId: string): Promise<Order | null> => {
    try {
      if (!tenantId) {
        throw new Error("No tenantId provided")
      }

      const orderRef = ref(rtdb, `tenants/${tenantId}/orders/${orderId}`)
      const orderSnapshot = await get(orderRef)

      if (orderSnapshot.exists()) {
        return {
          id: orderId,
          ...orderSnapshot.val(),
        } as Order
      }

      return null
    } catch (err) {
      console.error("Error getting order:", err)
      throw err
    }
  }

  const value: OrderContextType = {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
    getOrder,
    refreshOrders: fetchOrders,
    updatingOrderIds, // Exportar el estado de actualización
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}
