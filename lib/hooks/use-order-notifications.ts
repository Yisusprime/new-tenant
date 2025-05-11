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
  const soundLoaded = useRef<boolean>(false)

  useEffect(() => {
    // Inicializar el sonido
    if (typeof window !== "undefined") {
      try {
        // Crear el elemento de audio
        const audio = new Audio("/sounds/new-order.mp3")

        // Configurar el manejo de errores
        audio.onerror = (e) => {
          console.error("Error al cargar el sonido:", e)
        }

        // Configurar el evento de carga
        audio.oncanplaythrough = () => {
          console.log("Sonido cargado correctamente")
          soundLoaded.current = true
        }

        // Precargar el audio
        audio.load()

        // Guardar la referencia
        notificationSound.current = audio
      } catch (error) {
        console.error("Error al inicializar el sonido:", error)
      }
    }

    return () => {
      // Limpiar el sonido al desmontar
      if (notificationSound.current) {
        notificationSound.current = null
        soundLoaded.current = false
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
          try {
            // Reiniciar el audio para asegurar que se reproduzca desde el principio
            notificationSound.current.currentTime = 0

            // Intentar reproducir el sonido
            const playPromise = notificationSound.current.play()

            // Manejar la promesa para evitar errores no capturados
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Reproduciendo sonido de notificación")
                })
                .catch((err) => {
                  console.error("Error al reproducir sonido:", err)

                  // Si el error es por interacción del usuario, intentar reproducir después
                  if (err.name === "NotAllowedError") {
                    console.log("La reproducción automática está bloqueada. Se requiere interacción del usuario.")

                    // Podríamos mostrar un mensaje al usuario aquí
                  }
                })
            }
          } catch (err) {
            console.error("Error al reproducir sonido:", err)
          }
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

  // Función para reproducir el sonido manualmente (útil para probar o para reproducir después de interacción)
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0
      return notificationSound.current
        .play()
        .then(() => true)
        .catch((err) => {
          console.error("Error al reproducir sonido manualmente:", err)
          return false
        })
    }
    return Promise.resolve(false)
  }

  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    playNotificationSound,
    soundLoaded: () => soundLoaded.current,
  }
}
