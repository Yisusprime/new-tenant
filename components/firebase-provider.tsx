"use client"

import { type ReactNode, useEffect, useState } from "react"
import { app } from "@/lib/firebase/client"

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Marcar que estamos en el cliente
    setIsClient(true)

    try {
      if (app) {
        console.log("Firebase inicializado correctamente:", app.name)
        setIsFirebaseInitialized(true)
      } else {
        console.error("Firebase no se inicializó correctamente")
        setError("Firebase no se inicializó correctamente. Verifica la configuración.")
      }
    } catch (err: any) {
      console.error("Error al verificar Firebase:", err)
      setError(err.message || "Error al inicializar Firebase")
    }
  }, [])

  // No renderizar nada durante SSR para evitar errores de hidratación
  if (!isClient) {
    return null
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">Error de configuración</h2>
        <p className="mb-6 max-w-md text-red-800">{error}</p>
        <p className="text-sm text-gray-600">
          Verifica que las variables de entorno de Firebase estén configuradas correctamente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!isFirebaseInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Inicializando Firebase...</p>
      </div>
    )
  }

  return <>{children}</>
}
