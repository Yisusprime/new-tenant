"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AuthProvider } from "@/lib/auth-context"

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Cargando...</div>
  }

  return <AuthProvider>{children}</AuthProvider>
}
