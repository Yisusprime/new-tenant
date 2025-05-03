"use client"

import { useEffect, useState, type ReactNode } from "react"
import { initializeFirebase } from "@/lib/firebase/client"
import LoadingScreen from "@/components/loading-screen"

interface FirebaseProviderProps {
  children: ReactNode
}

export default function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initAttempts, setInitAttempts] = useState(0)

  useEffect(() => {
    const maxAttempts = 3

    if (initAttempts >= maxAttempts) {
      setError("No se pudo inicializar Firebase después de varios intentos. Por favor, recarga la página.")
      return
    }

    try {
      // Intentar inicializar Firebase
      const { app } = initializeFirebase()

      if (app) {
        console.log("Firebase inicializado correctamente en el proveedor")
        setIsInitialized(true)
      } else {
        // Si no se pudo inicializar, incrementar el contador de intentos
        setInitAttempts((prev) => prev + 1)

        // Esperar un momento y volver a intentar
        setTimeout(() => {
          console.log(`Reintentando inicialización de Firebase (intento ${initAttempts + 1}/${maxAttempts})`)
        }, 1000)
      }
    } catch (err) {
      console.error("Error al inicializar Firebase en el proveedor:", err)

      // Incrementar el contador de intentos
      setInitAttempts((prev) => prev + 1)

      if (initAttempts >= maxAttempts - 1) {
        setError("Error al inicializar Firebase. Por favor, recarga la página.")
      } else {
        // Esperar un momento y volver a intentar
        setTimeout(() => {
          console.log(`Reintentando inicialización de Firebase (intento ${initAttempts + 1}/${maxAttempts})`)
        }, 1000)
      }
    }
  }, [initAttempts])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-2xl font-bold">Error de inicialización</h1>
        <p className="mb-6 text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Recargar página
        </button>
      </div>
    )
  }

  if (!isInitialized) {
    return <LoadingScreen message="Inicializando aplicación..." />
  }

  return <>{children}</>
}
