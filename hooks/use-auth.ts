"use client"

import { useContext, useEffect } from "react"
import { AuthContext } from "@/lib/context/auth-context"

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }

  // Reset session timeout when the hook is used
  useEffect(() => {
    if (context.user) {
      context.resetSessionTimeout()
    }
  }, [context])

  return context
}
