"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface OrderTimerProps {
  startTime: string
  status: string
  className?: string
}

export function OrderTimer({ startTime, status, className }: OrderTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerColor, setTimerColor] = useState("text-green-600")

  useEffect(() => {
    // Calcular tiempo inicial
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const initialElapsed = Math.floor((now - start) / 1000) // en segundos

    setElapsedTime(initialElapsed)

    // Actualizar el temporizador cada segundo
    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1

        // Actualizar color según el tiempo transcurrido
        if (newTime >= 600) {
          // 10 minutos
          setTimerColor("text-red-600")
        } else if (newTime >= 300) {
          // 5 minutos
          setTimerColor("text-yellow-600")
        } else {
          setTimerColor("text-green-600")
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime]) // Se reinicia cuando cambia startTime

  // Formatear el tiempo en MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return <div className={cn("font-mono font-bold", timerColor, className)}>{formatTime(elapsedTime)}</div>
}
