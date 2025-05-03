"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { initializeFirebase } from "@/lib/firebase/client"

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    try {
      initializeFirebase()
      setInitialized(true)
    } catch (error) {
      console.error("Error inicializando Firebase:", error)
    }
  }, [])

  if (!initialized && typeof window !== "undefined") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Inicializando aplicación...</p>
      </div>
    )
  }

  return <>{children}</>
}
