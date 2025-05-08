"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false)

      if (!user && !pathname.includes("/login")) {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-card border-r p-4 hidden md:block">
        <div className="text-xl font-bold mb-6">Panel de Admin</div>
        <nav className="space-y-2">
          <a href="/admin/dashboard" className="block p-2 rounded hover:bg-muted">
            Dashboard
          </a>
          <a href="/admin/menu" className="block p-2 rounded hover:bg-muted">
            Gestionar Menú
          </a>
          <a href="/admin/settings" className="block p-2 rounded hover:bg-muted">
            Configuración
          </a>
          <button
            className="block w-full text-left p-2 rounded hover:bg-muted text-destructive"
            onClick={() => auth.signOut().then(() => router.push("/login"))}
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
