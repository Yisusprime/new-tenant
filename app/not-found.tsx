"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-6">Página no encontrada</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Volver atrás
        </Button>
      </div>
    </div>
  )
}
