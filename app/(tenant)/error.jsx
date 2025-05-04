"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-xl mb-6">Ha ocurrido un error al cargar la página del restaurante</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Intentar de nuevo</Button>
          <Link href="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
