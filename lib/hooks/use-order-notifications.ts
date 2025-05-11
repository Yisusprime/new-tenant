"use client"

import { useEffect, useRef, useState } from "react"
import { ref, onChildAdded, off, onChildChanged } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { Order } from "@/lib/types/order"

export function useOrderNotifications(tenantId: string, branchId: string | null) {
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  const notificationsEnabled = useRef<boolean>(true)
  const [soundLoaded, setSoundLoaded] = useState<boolean>(false)
  const [soundError, setSoundError] = useState<string | null>(null)

  // Usamos un enfoque más simple para el sonido
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Efecto para escuchar nuevos pedidos
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
        if (notificationsEnabled.current && soundLoaded) {
          playSound()
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

  // Función para reproducir el sonido
  const playSound = () => {
    if (!audioRef.current) return false

    try {
      // Reiniciar el audio para asegurar que se reproduzca desde el principio
      audioRef.current.currentTime = 0

      // Intentar reproducir el sonido
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error al reproducir sonido:", error)
        })
      }

      return true
    } catch (error) {
      console.error("Error al intentar reproducir sonido:", error)
      return false
    }
  }

  // Función para alternar notificaciones
  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  // Efecto para crear el elemento de audio una sola vez
  useEffect(() => {
    // Limpiar cualquier audio existente
    if (audioRef.current) {
      audioRef.current = null
    }

    // Crear un nuevo elemento de audio
    if (typeof window !== "undefined") {
      try {
        const audio = new Audio("/notification.mp3")

        // Configurar eventos
        audio.addEventListener("canplaythrough", () => {
          console.log("Sonido cargado correctamente")
          setSoundLoaded(true)
          setSoundError(null)
        })

        audio.addEventListener("error", (e) => {
          console.error("Error al cargar el sonido:", e)
          setSoundError("No se pudo cargar el sonido")
          setSoundLoaded(false)
        })

        // Guardar la referencia
        audioRef.current = audio

        // Precargar el audio
        audio.load()
      } catch (error) {
        console.error("Error al inicializar el sonido:", error)
        setSoundError("Error al inicializar el sonido")
      }
    }

    // Limpiar al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current = null
        setSoundLoaded(false)
      }
    }
  }, [])

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    playNotificationSound: playSound,
    soundLoaded,
    soundError,
    reloadSound: () => {
      if (audioRef.current) {
        audioRef.current.load()
      }
    },
  }
}
