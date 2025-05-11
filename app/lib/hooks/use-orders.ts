"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useBranch } from "../context/branch-context"
import { OrderService } from "../services/order-service"
import { OrderStatus, OrderType } from "../types/order"

export const useOrders = () => {
  const params = useParams()
  const tenantId = params.tenantId as string
  const { currentBranch: selectedBranch } = useBranch()

  const [orders, setOrders] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar todos los pedidos
  const loadAllOrders = useCallback(async () => {
    if (!selectedBranch) return

    setLoading(true)
    setError(null)

    try {
      const allOrders = await OrderService.getAllOrders(tenantId, selectedBranch.id)
      setOrders(allOrders)
    } catch (err: any) {
      console.error("Error al cargar pedidos:", err)
      setError(err.message || "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [tenantId, selectedBranch])

  // Función para cargar pedidos por tipo
  const loadOrdersByType = useCallback(
    async (type: OrderType) => {
      if (!selectedBranch) return

      setLoading(true)
      setError(null)

      try {
        const filteredOrders = await OrderService.getOrdersByType(tenantId, selectedBranch.id, type)
        setOrders(filteredOrders)
      } catch (err: any) {
        console.error(`Error al cargar pedidos de tipo ${type}:`, err)
        setError(err.message || `Error al cargar pedidos de tipo ${type}`)
        // Si hay un error de índice, cargar todos los pedidos y filtrar en el cliente
        if (err.message?.includes("index")) {
          try {
            const allOrders = await OrderService.getAllOrders(tenantId, selectedBranch.id)
            const filteredOrders = allOrders.filter((order) => order.type === type)
            setOrders(filteredOrders)
            setError(null)
          } catch (fallbackErr: any) {
            setError(fallbackErr.message || "Error al cargar pedidos")
          }
        }
      } finally {
        setLoading(false)
      }
    },
    [tenantId, selectedBranch],
  )

  // Función para cargar mesas
  const loadTables = useCallback(async () => {
    if (!selectedBranch) return

    setLoading(true)

    try {
      const allTables = await OrderService.getTables(tenantId, selectedBranch.id)
      setTables(allTables)
    } catch (err: any) {
      console.error("Error al cargar mesas:", err)
      setError(err.message || "Error al cargar mesas")
    } finally {
      setLoading(false)
    }
  }, [tenantId, selectedBranch])

  // Función para crear un pedido
  const createOrder = useCallback(
    async (orderData: any) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        const newOrder = await OrderService.createOrder(tenantId, selectedBranch.id, orderData)

        // Si el pedido es para mesa, actualizar el estado de la mesa
        if (orderData.type === OrderType.DINE_IN && orderData.tableId) {
          await OrderService.updateTable(tenantId, selectedBranch.id, orderData.tableId, {
            isOccupied: true,
            currentOrderId: newOrder.id,
          })
        }

        // Recargar pedidos después de crear uno nuevo
        await loadAllOrders()

        return newOrder
      } catch (err: any) {
        console.error("Error al crear pedido:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadAllOrders],
  )

  // Función para actualizar el estado de un pedido
  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus, orderData?: any) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        await OrderService.updateOrderStatus(tenantId, selectedBranch.id, orderId, status)

        // Si el pedido se completa o cancela y es de mesa, liberar la mesa
        if (
          (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) &&
          orderData?.type === OrderType.DINE_IN &&
          orderData?.tableId
        ) {
          await OrderService.updateTable(tenantId, selectedBranch.id, orderData.tableId, {
            isOccupied: false,
            currentOrderId: null,
          })
        }

        // Recargar pedidos después de actualizar
        await loadAllOrders()

        return true
      } catch (err: any) {
        console.error("Error al actualizar estado del pedido:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadAllOrders],
  )

  // Función para eliminar un pedido
  const deleteOrder = useCallback(
    async (orderId: string, orderData?: any) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        await OrderService.deleteOrder(tenantId, selectedBranch.id, orderId)

        // Si el pedido es de mesa, liberar la mesa
        if (orderData?.type === OrderType.DINE_IN && orderData?.tableId) {
          await OrderService.updateTable(tenantId, selectedBranch.id, orderData.tableId, {
            isOccupied: false,
            currentOrderId: null,
          })
        }

        // Recargar pedidos después de eliminar
        await loadAllOrders()

        return true
      } catch (err: any) {
        console.error("Error al eliminar pedido:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadAllOrders],
  )

  // Funciones para gestión de mesas
  const createTable = useCallback(
    async (tableData: any) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        const newTable = await OrderService.createTable(tenantId, selectedBranch.id, tableData)

        // Recargar mesas después de crear una nueva
        await loadTables()

        return newTable
      } catch (err: any) {
        console.error("Error al crear mesa:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadTables],
  )

  const updateTable = useCallback(
    async (tableId: string, tableData: any) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        await OrderService.updateTable(tenantId, selectedBranch.id, tableId, tableData)

        // Recargar mesas después de actualizar
        await loadTables()

        return true
      } catch (err: any) {
        console.error("Error al actualizar mesa:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadTables],
  )

  const deleteTable = useCallback(
    async (tableId: string) => {
      if (!selectedBranch) throw new Error("No hay sucursal seleccionada")

      try {
        await OrderService.deleteTable(tenantId, selectedBranch.id, tableId)

        // Recargar mesas después de eliminar
        await loadTables()

        return true
      } catch (err: any) {
        console.error("Error al eliminar mesa:", err)
        throw err
      }
    },
    [tenantId, selectedBranch, loadTables],
  )

  // Cargar pedidos inicialmente cuando cambia la sucursal
  useEffect(() => {
    if (selectedBranch) {
      loadAllOrders()
    }
  }, [selectedBranch, loadAllOrders])

  return {
    orders,
    tables,
    loading,
    error,
    loadAllOrders,
    loadOrdersByType,
    loadTables,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    createTable,
    updateTable,
    deleteTable,
  }
}

// Asegurarnos de que useOrders se exporte como una exportación nombrada
