"use client"

import { useEffect } from "react"

export default function NotFound() {
  // Evitar cualquier acceso al DOM durante el renderizado del servidor
  useEffect(() => {
    // Cualquier lógica del lado del cliente puede ir aquí
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-6">Página no encontrada</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <div className="flex gap-4">
        <a href="/" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
