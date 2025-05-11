"use client"

import { useState, useEffect, useRef } from "react"
import { ref, onValue, off, query, orderByChild, equalTo } from "firebase/database"
import { db } from "@/lib/firebase/client"
import { type Order, OrderStatus } from "@/lib/types/order"

export function useOrderNotifications(branchId?: string) {
  const [newOrders, setNewOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioFormatsRef = useRef([
    { src: "/sounds/new-order.mp3", type: "audio/mp3" },
    { src: "/sounds/new-order.wav", type: "audio/wav" },
    { src: "/sounds/new-order.ogg", type: "audio/ogg" },
  ])
  const lastOrderTimestampRef = useRef<number>(Date.now())

  // Función para reproducir sonido con múltiples formatos
  const playNotificationSound = () => {
    try {
      // Si ya tenemos un elemento de audio creado, intentamos usarlo primero
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current
          .play()
          .then(() => console.log("Reproduciendo audio existente"))
          .catch((err) => {
            console.error("Error al reproducir audio existente:", err)
            tryNextFormat(0) // Si falla, intentamos con los formatos desde el principio
          })
        return
      }

      // Si no tenemos un elemento de audio, intentamos crear uno nuevo
      tryNextFormat(0)
    } catch (error) {
      console.error("Error al reproducir sonido:", error)
    }
  }

  // Función recursiva para probar diferentes formatos de audio
  const tryNextFormat = (index: number) => {
    if (index >= audioFormatsRef.current.length) {
      console.error("No se pudo reproducir ningún formato de audio")
      return
    }

    const format = audioFormatsRef.current[index]
    const audio = new Audio(format.src)

    // Precargamos el audio
    audio.preload = "auto"

    // Configuramos los manejadores de eventos
    audio.oncanplaythrough = () => {
      audioRef.current = audio // Guardamos la referencia para futuros usos
      audio
        .play()
        .then(() => console.log("Reproduciendo audio:", format.src))
        .catch((err) => {
          console.error("Error al reproducir:", err)
          tryNextFormat(index + 1)
        })
    }

    audio.onerror = () => {
      console.error("Error al cargar:", format.src)
      tryNextFormat(index + 1)
    }

    // Establecemos un tiempo límite para la carga
    setTimeout(() => {
      if (audio.readyState < 3) {
        // HAVE_FUTURE_DATA
        tryNextFormat(index + 1)
      }
    }, 1000)
  }

  useEffect(() => {
    if (!branchId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Precargamos los formatos de audio para uso futuro
    audioFormatsRef.current.forEach((format) => {
      const audio = new Audio(format.src)
      audio.preload = "auto"
    })

    // Referencia a todas las órdenes de la sucursal
    const ordersRef = query(ref(db, "orders"), orderByChild("branchId"), equalTo(branchId))

    const handleNewOrder = (snapshot: any) => {
      if (!snapshot.exists()) {
        setNewOrders([])
        setIsLoading(false)
        return
      }

      const ordersData = snapshot.val()
      const ordersArray: Order[] = Object.keys(ordersData).map((key) => ({
        id: key,
        ...ordersData[key],
      }))

      // Filtramos las órdenes nuevas (pendientes)
      const pendingOrders = ordersArray.filter((order) => order.status === OrderStatus.PENDING)

      // Verificamos si hay órdenes nuevas desde la última vez
      const latestOrderTimestamp = Math.max(...ordersArray.map((order) => order.createdAt || 0))

      // Si hay una orden más reciente que la última que vimos y tenemos órdenes pendientes
      if (latestOrderTimestamp > lastOrderTimestampRef.current && pendingOrders.length > 0) {
        playNotificationSound()
      }

      // Actualizamos el timestamp de la última orden
      lastOrderTimestampRef.current = latestOrderTimestamp

      setNewOrders(pendingOrders)
      setIsLoading(false)
    }

    onValue(ordersRef, handleNewOrder)

    return () => {
      off(ordersRef, "value", handleNewOrder)
    }
  }, [branchId])

  return {
    newOrders,
    isLoading,
    playSound: playNotificationSound,
  }
}
