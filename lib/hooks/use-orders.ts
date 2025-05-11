"use client"

import { useState, useEffect, useCallback } from "react"
import { OrderService } from "@/lib/services/order-service"
import type { Order, OrderStatus, OrderSummary, OrderType, TableInfo } from "@/lib/types/order"
import { useBranch } from "@/lib/context/branch-context"

export function useOrders(tenantId: string) {
  const { currentBranch } = useBranch()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderService = currentBranch ? new OrderService(tenantId, currentBranch.id) : null

  const fetchOrders = useCallback(async () => {
    if (!orderService) return

    setLoading(true)
    try {
      const fetchedOrders = await orderService.getOrders()
      setOrders(fetchedOrders)
      setError(null)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }, [orderService])

  const fetchOrdersByType = useCallback(
    async (type: OrderType) => {
      if (!orderService) return

      setLoading(true)
      try {
        const fetchedOrders = await orderService.getOrdersByType(type)
        setOrders(fetchedOrders)
        setError(null)
      } catch (err) {
        console.error(`Error fetching orders of type ${type}:`, err)
        setError(`Error al cargar los pedidos de tipo ${type}`)
      } finally {
        setLoading(false)
      }
    },
    [orderService],
  )

  const fetchOrdersByStatus = useCallback(
    async (status: OrderStatus) => {
      if (!orderService) return

      setLoading(true)
      try {
        const fetchedOrders = await orderService.getOrdersByStatus(status)
        setOrders(fetchedOrders)
        setError(null)
      } catch (err) {
        console.error(`Error fetching orders with status ${status}:`, err)
        setError(`Error al cargar los pedidos con estado ${status}`)
      } finally {
        setLoading(false)
      }
    },
    [orderService],
  )

  const fetchOrderById = useCallback(
    async (orderId: string) => {
      if (!orderService) return null

      try {
        return await orderService.getOrderById(orderId)
      } catch (err) {
        console.error(`Error fetching order ${orderId}:`, err)
        throw err
      }
    },
    [orderService],
  )

  const createOrder = useCallback(
    async (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
      if (!orderService) return null

      try {
        const orderId = await orderService.createOrder(order)
        fetchOrders() // Refresh orders after creating a new one
        return orderId
      } catch (err) {
        console.error("Error creating order:", err)
        throw err
      }
    },
    [orderService, fetchOrders],
  )

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      if (!orderService) return

      try {
        await orderService.updateOrderStatus(orderId, status)
        fetchOrders() // Refresh orders after updating
      } catch (err) {
        console.error(`Error updating order ${orderId} status:`, err)
        throw err
      }
    },
    [orderService, fetchOrders],
  )

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>) => {
      if (!orderService) return

      try {
        await orderService.updateOrder(orderId, updates)
        fetchOrders() // Refresh orders after updating
      } catch (err) {
        console.error(`Error updating order ${orderId}:`, err)
        throw err
      }
    },
    [orderService, fetchOrders],
  )

  const deleteOrder = useCallback(
    async (orderId: string) => {
      if (!orderService) return

      try {
        await orderService.deleteOrder(orderId)
        fetchOrders() // Refresh orders after deleting
      } catch (err) {
        console.error(`Error deleting order ${orderId}:`, err)
        throw err
      }
    },
    [orderService, fetchOrders],
  )

  const fetchTables = useCallback(async () => {
    if (!orderService) return

    try {
      const fetchedTables = await orderService.getAllTables()
      setTables(fetchedTables)
    } catch (err) {
      console.error("Error fetching tables:", err)
      throw err
    }
  }, [orderService])

  const fetchAvailableTables = useCallback(async () => {
    if (!orderService) return []

    try {
      return await orderService.getAvailableTables()
    } catch (err) {
      console.error("Error fetching available tables:", err)
      throw err
    }
  }, [orderService])

  const createTable = useCallback(
    async (table: Omit<TableInfo, "id">) => {
      if (!orderService) return null

      try {
        const tableId = await orderService.createTable(table)
        fetchTables() // Refresh tables after creating a new one
        return tableId
      } catch (err) {
        console.error("Error creating table:", err)
        throw err
      }
    },
    [orderService, fetchTables],
  )

  const updateTable = useCallback(
    async (tableId: string, updates: Partial<TableInfo>) => {
      if (!orderService) return

      try {
        await orderService.updateTable(tableId, updates)
        fetchTables() // Refresh tables after updating
      } catch (err) {
        console.error(`Error updating table ${tableId}:`, err)
        throw err
      }
    },
    [orderService, fetchTables],
  )

  const deleteTable = useCallback(
    async (tableId: string) => {
      if (!orderService) return

      try {
        await orderService.deleteTable(tableId)
        fetchTables() // Refresh tables after deleting
      } catch (err) {
        console.error(`Error deleting table ${tableId}:`, err)
        throw err
      }
    },
    [orderService, fetchTables],
  )

  useEffect(() => {
    if (currentBranch) {
      fetchOrders()
      fetchTables()
    }
  }, [currentBranch, fetchOrders, fetchTables])

  return {
    orders,
    tables,
    loading,
    error,
    fetchOrders,
    fetchOrdersByType,
    fetchOrdersByStatus,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    fetchTables,
    fetchAvailableTables,
    createTable,
    updateTable,
    deleteTable,
  }
}
