"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LogoutButton({ variant = "ghost", size = "default", className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      // La redirección se maneja en la función signOut
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={loading}>
      {loading ? (
        <span className="flex items-center">
          <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full"></span>
          Cerrando sesión...
        </span>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </>
      )}
    </Button>
  )
}
