"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Algo salió mal</h1>
          <p className="text-lg text-gray-600 mb-8">Lo sentimos, ha ocurrido un error inesperado.</p>
          <Button onClick={() => reset()}>Intentar de nuevo</Button>
        </div>
      </body>
    </html>
  )
}
