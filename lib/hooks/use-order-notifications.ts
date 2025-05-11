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
  const [soundLoaded, setSoundLoaded] = useState<boolean>(false)
  const [soundError, setSoundError] = useState<string | null>(null)

  // Función para intentar cargar el sonido con diferentes rutas
  const loadSound = () => {
    if (typeof window === "undefined") return

    // Lista de posibles rutas para el archivo de sonido
    const possiblePaths = ["/sounds/notification.mp3", "/notification.mp3", "/sounds/new-order.mp3", "/new-order.mp3"]

    // Intentar cargar el sonido desde cada ruta
    const tryLoadSound = (paths: string[], index = 0) => {
      if (index >= paths.length) {
        console.error("No se pudo cargar el sonido desde ninguna ruta")
        setSoundError("No se pudo cargar el sonido desde ninguna ruta")
        return
      }

      const path = paths[index]
      console.log(`Intentando cargar sonido desde: ${path}`)

      const audio = new Audio(path)

      // Manejar evento de carga exitosa
      audio.oncanplaythrough = () => {
        console.log(`Sonido cargado exitosamente desde: ${path}`)
        notificationSound.current = audio
        setSoundLoaded(true)
        setSoundError(null)
      }

      // Manejar error de carga
      audio.onerror = (e) => {
        console.error(`Error al cargar sonido desde ${path}:`, e)

        // Intentar con la siguiente ruta
        tryLoadSound(paths, index + 1)
      }

      // Iniciar carga
      audio.load()
    }

    // Comenzar a intentar cargar el sonido
    tryLoadSound(possiblePaths)
  }

  // Cargar el sonido al montar el componente
  useEffect(() => {
    loadSound()

    return () => {
      // Limpiar el sonido al desmontar
      if (notificationSound.current) {
        notificationSound.current = null
        setSoundLoaded(false)
      }
    }
  }, [])

  // Escuchar nuevos pedidos
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
        if (notificationsEnabled.current && soundLoaded && notificationSound.current) {
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
  }, [tenantId, branchId, soundLoaded])

  // Función para reproducir el sonido manualmente
  const playNotificationSound = () => {
    if (!soundLoaded || !notificationSound.current) {
      console.log("El sonido no está cargado, intentando cargar...")
      loadSound()
      return Promise.resolve(false)
    }

    try {
      notificationSound.current.currentTime = 0
      return notificationSound.current
        .play()
        .then(() => {
          console.log("Sonido reproducido manualmente con éxito")
          return true
        })
        .catch((err) => {
          console.error("Error al reproducir sonido manualmente:", err)
          return false
        })
    } catch (err) {
      console.error("Error al intentar reproducir sonido:", err)
      return Promise.resolve(false)
    }
  }

  // Función para alternar notificaciones
  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  // Función para recargar el sonido
  const reloadSound = () => {
    setSoundLoaded(false)
    setSoundError(null)
    loadSound()
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    playNotificationSound,
    soundLoaded,
    soundError,
    reloadSound,
  }
}
