"use client"

import { useEffect, useRef, useState } from "react"
import { ref, onChildAdded, off, onChildChanged } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { Order } from "@/lib/types/order"

export function useOrderNotifications(tenantId: string, branchId: string | null) {
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  const notificationsEnabled = useRef<boolean>(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationOrderId, setNotificationOrderId] = useState<string | undefined>(undefined)

  // Cargar preferencia de notificaciones
  useEffect(() => {
    const savedPreference = localStorage.getItem("visualNotificationsEnabled")
    if (savedPreference !== null) {
      notificationsEnabled.current = savedPreference === "true"
    }
  }, [])

  // Solicitar permiso para notificaciones del navegador al inicio
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission()
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

        // Mostrar notificación si están habilitadas
        if (notificationsEnabled.current) {
          // Vibrar el dispositivo si es compatible (móviles)
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }

          // Mostrar notificación visual
          setNotificationMessage(`Pedido #${order.orderNumber || "Nuevo"} recibido`)
          setNotificationOrderId(order.id)
          setShowNotification(true)
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
    // Guardar preferencia
    localStorage.setItem("visualNotificationsEnabled", notificationsEnabled.current.toString())
    return notificationsEnabled.current
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    showNotification,
    notificationMessage,
    notificationOrderId,
    hideNotification: () => setShowNotification(false),
  }
}
