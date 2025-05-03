"use client"

import { type ReactNode, useEffect, useState } from "react"
import { app } from "@/lib/firebase/client"

export default function FirebaseProvider({ children }: { children: ReactNode }) {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (app) {
        setIsFirebaseInitialized(true)
      }
    } catch (err: any) {
      console.error("Error al verificar Firebase:", err)
      setError(err.message || "Error al inicializar Firebase")
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">Error de configuración</h2>
        <p className="mb-6 max-w-md text-red-800">{error}</p>
        <p className="text-sm text-gray-600">
          Verifica que las variables de entorno de Firebase estén configuradas correctamente.
        </p>
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
