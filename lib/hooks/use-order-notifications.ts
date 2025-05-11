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
  const [notificationType, setNotificationType] = useState<"audio" | "visual" | "none">("none")
  const [showVisualNotification, setShowVisualNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")

  // Verificar el tipo de notificación configurado
  useEffect(() => {
    const storedPermission = localStorage.getItem("notificationsPermission")
    if (storedPermission === "audio") {
      setNotificationType("audio")
    } else if (storedPermission === "visual") {
      setNotificationType("visual")
    } else {
      setNotificationType("none")
    }
  }, [])

  // Función para crear y configurar el elemento de audio
  const setupAudio = () => {
    if (typeof window === "undefined") return
    if (notificationType !== "audio") return

    try {
      // Crear un nuevo elemento de audio
      const audio = new Audio("/sounds/new-order.mp3")

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
      })

      // Guardar la referencia
      notificationSound.current = audio

      // Iniciar la carga
      audio.load()
    } catch (err) {
      console.error("Error al configurar el audio:", err)
    }
  }

  // Configurar el audio cuando se establece el tipo de notificación
  useEffect(() => {
    if (notificationType === "audio") {
      setupAudio()
    }

    return () => {
      // Limpiar
      if (notificationSound.current) {
        notificationSound.current.pause()
        notificationSound.current = null
      }
      audioLoaded.current = false
    }
  }, [notificationType])

  // Función para reproducir el sonido
  const playNotificationSound = () => {
    if (!notificationSound.current || notificationType !== "audio") return

    try {
      // Reiniciar el audio
      notificationSound.current.currentTime = 0

      // Intentar reproducir
      const playPromise = notificationSound.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error("Error al reproducir:", err)
        })
      }
    } catch (err) {
      console.error("Error al intentar reproducir:", err)
    }
  }

  // Función para mostrar notificación visual
  const showNotification = (order: Order) => {
    setNotificationMessage(`Pedido #${order.orderNumber} recibido`)
    setShowVisualNotification(true)
  }

  useEffect(() => {
    if (!tenantId || !branchId || notificationType === "none") return

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

        // Notificar según el tipo configurado
        if (notificationsEnabled.current) {
          if (notificationType === "audio") {
            playNotificationSound()
          }
          if (notificationType === "visual") {
            showNotification(order)
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
  }, [tenantId, branchId, notificationType])

  const toggleNotifications = () => {
    notificationsEnabled.current = !notificationsEnabled.current
    return notificationsEnabled.current
  }

  // Función para probar el sonido (útil para depuración)
  const testSound = () => {
    if (notificationType !== "audio") {
      console.log("No se ha configurado notificación de audio")
      return false
    }

    playNotificationSound()
    return audioLoaded.current
  }

  // Funciones para manejar permisos
  const setAudioNotifications = () => {
    setNotificationType("audio")
    localStorage.setItem("notificationsPermission", "audio")
  }

  const setVisualNotifications = () => {
    setNotificationType("visual")
    localStorage.setItem("notificationsPermission", "visual")
  }

  const disableNotifications = () => {
    setNotificationType("none")
    localStorage.setItem("notificationsPermission", "denied")
  }

  return {
    newOrder,
    updatedOrder,
    notificationsEnabled: () => notificationsEnabled.current,
    toggleNotifications,
    testSound,
    notificationType,
    setAudioNotifications,
    setVisualNotifications,
    disableNotifications,
    showVisualNotification,
    notificationMessage,
    hideVisualNotification: () => setShowVisualNotification(false),
  }
}
