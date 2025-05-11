"use client"

import { useEffect, useRef } from "react"

export function AudioNotification() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Crear el elemento de audio directamente en el DOM
    const audio = document.createElement("audio")
    audio.src = "/notification.mp3"
    audio.id = "notification-sound"
    audio.preload = "auto"

    // Añadir el elemento al DOM
    document.body.appendChild(audio)

    // Guardar la referencia
    audioRef.current = audio

    // Limpiar al desmontar
    return () => {
      if (audioRef.current) {
        document.body.removeChild(audioRef.current)
        audioRef.current = null
      }
    }
  }, [])

  return null
}
