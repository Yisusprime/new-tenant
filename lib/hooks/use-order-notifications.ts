"use client"

import { useEffect, useRef, useState } from "react"
import { ref, onChildAdded, off, onChildChanged } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { Order } from "@/lib/types/order"

// Definir las URLs de los sonidos
const NOTIFICATION_SOUNDS = {
  mp3: "/sounds/new-order.mp3",
  wav: "/sounds/new-order.wav",
  ogg: "/sounds/new-order.ogg",
}

export function useOrderNotifications(tenantId: string, branchId: string | null) {
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  const notificationsEnabled = useRef<boolean>(true)
  const [audioError, setAudioError] = useState<string | null>(null)

  // Función para reproducir el sonido
  const playNotificationSound = () => {
    if (!notificationsEnabled.current) return Promise.resolve()

    // Crear un nuevo elemento de audio cada vez
    const audio = new Audio()

    // Intentar con diferentes formatos
    audio.src = NOTIFICATION_SOUNDS.mp3

    // Fallback para navegadores que no soportan MP3
    audio.onerror = () => {
      console.log("MP3 no soportado, intentando con WAV")
      audio.src = NOTIFICATION_SOUNDS.wav

      audio.onerror = () => {
        console.error("No se pudo reproducir ningún formato de audio")
        setAudioError("No se pudo reproducir el sonido de notificación")
        return Promise.reject(new Error("No se pudo reproducir ningún formato de audio"))
      }
    }

    return audio.play().catch((err) => {
      console.error("Error al reproducir sonido:", err)

      // Si el error es por interacción del usuario, mostramos un mensaje específico
      if (err.name === "NotAllowedError") {
        setAudioError("El navegador bloqueó la reproducción automática. Interactúa con la página primero.")
      } else {
        setAudioError(`Error al reproducir sonido: ${err.message}`)
      }

      return Promise.reject(err)
    })
  }

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

        // Reproducir sonido
        playNotificationSound().catch(() => {
          // Error ya manejado en la función
        })
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

  // Función para probar el sonido
  const testSound = () => {
    return playNotificationSound()
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    audioError,
    testSound,
  }
}
