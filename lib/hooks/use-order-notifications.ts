"use client"

import { useEffect, useRef, useState } from "react"
import { ref, onChildAdded, off, onChildChanged } from "firebase/database"
import { realtimeDb } from "@/lib/firebase/client"
import type { Order } from "@/lib/types/order"

export function useOrderNotifications(tenantId: string, branchId: string | null) {
  const [newOrder, setNewOrder] = useState<Order | null>(null)
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const audioLoaded = useRef<boolean>(false)
  const notificationsEnabled = useRef<boolean>(true)

  // Función para crear y configurar el elemento de audio
  const setupAudio = () => {
    if (typeof window === "undefined") return

    try {
      // Crear un nuevo elemento de audio
      const audio = new Audio()

      // Configurar múltiples fuentes para mayor compatibilidad
      const source1 = document.createElement("source")
      source1.src = "/sounds/new-order.mp3"
      source1.type = "audio/mpeg"

      // Agregar las fuentes al elemento de audio
      audio.appendChild(source1)

      // Configurar el audio
      audio.preload = "auto"

      // Manejar eventos
      audio.addEventListener("canplaythrough", () => {
        console.log("Audio cargado correctamente")
        audioLoaded.current = true
      })

      audio.addEventListener("error", (e) => {
        console.error("Error detallado al cargar el audio:", {
          code: audio.error?.code,
          message: audio.error?.message,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src,
          error: e,
        })

        // Intentar cargar directamente como fallback
        audio.src = "/sounds/new-order.mp3"
      })

      // Guardar la referencia
      notificationSound.current = audio

      // Iniciar la carga
      audio.load()
    } catch (err) {
      console.error("Error al configurar el audio:", err)
    }
  }

  // Función para reproducir el sonido
  const playNotificationSound = () => {
    if (!notificationSound.current) return

    try {
      // Reiniciar el audio
      notificationSound.current.currentTime = 0

      // Intentar reproducir
      const playPromise = notificationSound.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Error al reproducir:", err)

          // Si falla por interacción del usuario, intentamos un enfoque alternativo
          if (err.name === "NotAllowedError") {
            console.log("Reproducción bloqueada por falta de interacción del usuario")
            // Aquí podrías mostrar un mensaje al usuario para que interactúe
          }
        })
      }
    } catch (err) {
      console.error("Error al intentar reproducir:", err)
    }
  }

  useEffect(() => {
    // Configurar el audio
    setupAudio()

    return () => {
      // Limpiar
      if (notificationSound.current) {
        notificationSound.current.pause()
        notificationSound.current = null
      }
      audioLoaded.current = false
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
        if (notificationsEnabled.current) {
          playNotificationSound()
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

  // Función para probar el sonido (útil para depuración)
  const testSound = () => {
    playNotificationSound()
    return audioLoaded.current
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    testSound, // Exportamos esta función para pruebas
  }
}
