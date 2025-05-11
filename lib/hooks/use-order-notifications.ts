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
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    // Inicializar el sonido
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio("/sounds/new-order.mp3")

        // Eventos para manejar la carga del audio
        audio.addEventListener("canplaythrough", () => {
          console.log("Audio cargado correctamente")
          setAudioLoaded(true)
          setAudioError(null)
        })

        audio.addEventListener("error", (e) => {
          console.error("Error al cargar el audio:", e)
          setAudioError("Error al cargar el sonido de notificación")
          setAudioLoaded(false)
        })

        // Cargar el audio
        audio.load()
        notificationSound.current = audio
      } catch (err) {
        console.error("Error al inicializar el audio:", err)
        setAudioError(`Error al inicializar el audio: ${err}`)
      }
    }

    return () => {
      // Limpiar el sonido al desmontar
      if (notificationSound.current) {
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
        if (notificationsEnabled.current && notificationSound.current && audioLoaded) {
          // Reiniciar el audio para poder reproducirlo múltiples veces
          notificationSound.current.currentTime = 0

          notificationSound.current.play().catch((err) => {
            console.error("Error al reproducir sonido:", err)
            setAudioError(`Error al reproducir sonido: ${err.message}`)
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
  }, [tenantId, branchId, audioLoaded])

  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  // Función para probar el sonido
  const testSound = () => {
    if (notificationSound.current && audioLoaded) {
      notificationSound.current.currentTime = 0
      return notificationSound.current.play().catch((err) => {
        console.error("Error al probar el sonido:", err)
        setAudioError(`Error al probar el sonido: ${err.message}`)
        return Promise.reject(err)
      })
    }
    return Promise.reject(new Error("Audio no cargado"))
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    audioLoaded,
    audioError,
    testSound,
  }
}
