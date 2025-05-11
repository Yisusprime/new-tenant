"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types/order"

interface OrderTimerProps {
  startTime: string
  status: OrderStatus
  className?: string
}

export function OrderTimer({ startTime, status, className }: OrderTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerColor, setTimerColor] = useState("text-green-600")

  // Determinar si el temporizador debe estar activo
  const isActiveTimer = status === "pending" || status === "preparing"

  useEffect(() => {
    // Calcular tiempo inicial
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const initialElapsed = Math.floor((now - start) / 1000) // en segundos

    setElapsedTime(initialElapsed)

    // Actualizar el color inicial
    updateTimerColor(initialElapsed)

    // Solo configurar el intervalo si el temporizador debe estar activo
    let timer: NodeJS.Timeout | null = null

    if (isActiveTimer) {
      timer = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1
          updateTimerColor(newTime)
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [startTime, isActiveTimer]) // Se reinicia cuando cambia startTime o isActiveTimer

  // Función para actualizar el color según el tiempo
  const updateTimerColor = (seconds: number) => {
    if (seconds >= 600) {
      // 10 minutos
      setTimerColor("text-red-600")
    } else if (seconds >= 300) {
      // 5 minutos
      setTimerColor("text-yellow-600")
    } else {
      setTimerColor("text-green-600")
    }
  }

  // Formatear el tiempo en MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("font-mono font-bold", timerColor, className)}>
      {formatTime(elapsedTime)}
      {!isActiveTimer && <span className="ml-1 text-xs font-normal text-gray-500">(detenido)</span>}
    </div>
  )
}
