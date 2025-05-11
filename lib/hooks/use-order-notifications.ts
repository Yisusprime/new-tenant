"use client"

import { useEffect, useRef, useState } from "react"
import { ref, onChildAdded, off, onChildChanged } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { Order } from "@/lib/types/order"

export function useOrderNotifications(tenantId: string, branchId: string | null) {
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const notificationsEnabled = useRef<boolean>(true)

  useEffect(() => {
    // Inicializar el sonido con la ruta correcta
    if (typeof window !== "undefined") {
      notificationSound.current = new Audio("/sounds/new-order.mp3")

      // Precargar el audio para evitar problemas de reproducción
      notificationSound.current.load()

      // Agregar listener para detectar errores de carga
      notificationSound.current.addEventListener("error", (e) => {
        console.error("Error al cargar el sonido:", e)
      })
    }

    return () => {
      // Limpiar el sonido al desmontar
      if (notificationSound.current) {
        notificationSound.current.pause()
        notificationSound.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!tenantId || !branchId) return

    const ordersRef = ref(realtimeDb, `tenants/${tenantId}/branches/${branchId}/orders`)

    // Escuchar nuevos pedidos
    const newOrderHandler = onChildAdded(ordersRef, (snapshot) => {
      const orderData = snapshot.val()
      if (!orderData) return

      const order: Order = {
        id: snapshot.key!,
        ...orderData,
      }

      // Solo notificar si el pedido es reciente (menos de 10 segundos)
      const orderTime = new Date(order.createdAt).getTime()
      const currentTime = Date.now()
      const isRecent = currentTime - orderTime < 10000 // 10 segundos

      if (isRecent) {
        setNewOrder(order)

        // Reproducir sonido si las notificaciones están habilitadas
        if (notificationsEnabled.current && notificationSound.current) {
          // Reiniciar el audio antes de reproducirlo
          notificationSound.current.currentTime = 0

          // Intentar reproducir con mejor manejo de errores
          notificationSound.current.play().catch((err) => {
            console.error("Error al reproducir sonido:", err)

            // Intentar cargar nuevamente el audio
            notificationSound.current?.load()
          })
        }
      }
    })

    // Escuchar cambios en pedidos existentes
    const updatedOrderHandler = onChildChanged(ordersRef, (snapshot) => {
      const orderData = snapshot.val()
      if (!orderData) return

      const order: Order = {
        id: snapshot.key!,
        ...orderData,
      }

      setUpdatedOrder(order)
    })

    // Limpiar listeners al desmontar
    return () => {
      off(ordersRef, "child_added", newOrderHandler)
      off(ordersRef, "child_changed", updatedOrderHandler)
    }
  }, [tenantId, branchId])

  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
  }
}
