"use client"

import { useState, useEffect, useCallback } from "react"
import { type Order, OrderType, OrderStatus } from "../types/order"
import { useBranch } from "../context/branch-context"

// Hook personalizado para gestionar pedidos
export function useOrders() {
  const { currentBranch } = useBranch()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar todos los pedidos
  const loadAllOrders = useCallback(async () => {
    if (!currentBranch) return

    setLoading(true)
    setError(null)

    try {
      // Aquí iría la lógica para cargar pedidos desde Firebase
      // Por ahora, usamos datos de ejemplo
      const mockOrders: Order[] = [
        {
          id: "order1",
          tenantId: "tenant1",
          branchId: currentBranch.id,
          orderNumber: "ORD-001",
          type: OrderType.DINE_IN,
          status: OrderStatus.PENDING,
          items: [
            {
              id: "item1",
              productId: "prod1",
              name: "Hamburguesa Clásica",
              price: 8.99,
              quantity: 2,
              subtotal: 17.98,
            },
          ],
          subtotal: 17.98,
          tax: 1.8,
          total: 19.78,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "order2",
          tenantId: "tenant1",
          branchId: currentBranch.id,
          orderNumber: "ORD-002",
          type: OrderType.TAKEOUT,
          status: OrderStatus.COMPLETED,
          items: [
            {
              id: "item2",
              productId: "prod2",
              name: "Pizza Margherita",
              price: 12.99,
              quantity: 1,
              subtotal: 12.99,
            },
          ],
          customer: {
            name: "Juan Pérez",
            phone: "123456789",
          },
          subtotal: 12.99,
          tax: 1.3,
          total: 14.29,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
        },
      ]

      setOrders(mockOrders)
    } catch (err) {
      console.error("Error al cargar pedidos:", err)
      setError("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }, [currentBranch])

  // Cargar pedidos por tipo
  const loadOrdersByType = useCallback(
    async (type: OrderType) => {
      if (!currentBranch) return

      setLoading(true)
      setError(null)

      try {
        // Aquí iría la lógica para cargar pedidos por tipo desde Firebase
        // Por ahora, filtramos los datos de ejemplo
        await loadAllOrders()
        setOrders((prevOrders) => prevOrders.filter((order) => order.type === type))
      } catch (err) {
        console.error(`Error al cargar pedidos de tipo ${type}:`, err)
        setError(`Error al cargar los pedidos de tipo ${type}`)
      } finally {
        setLoading(false)
      }
    },
    [currentBranch, loadAllOrders],
  )

  // Cargar pedidos al iniciar si hay una sucursal seleccionada
  useEffect(() => {
    if (currentBranch) {
      loadAllOrders()
    }
  }, [currentBranch, loadAllOrders])

  return {
    orders,
    loading,
    error,
    loadAllOrders,
    loadOrdersByType,
  }
}
