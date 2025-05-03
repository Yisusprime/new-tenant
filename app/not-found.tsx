"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function NotFound() {
  // Asegurarse de que cualquier acceso al DOM solo ocurra en el cliente
  useEffect(() => {
    // Código del lado del cliente aquí
    console.log("Página 404 cargada en el cliente")
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-6">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
