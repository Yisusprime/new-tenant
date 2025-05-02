"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Unauthorized() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-8">
          No tienes permiso para acceder a este tenant. Por favor, contacta con el administrador si crees que esto es un
          error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard">Ir a mi Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  )
}
