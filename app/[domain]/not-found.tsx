import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Restaurante no encontrado</h1>
      <p className="text-gray-500 mb-8">El restaurante que estás buscando no existe o no está disponible.</p>
      <Link href="/" className="text-primary hover:underline">
        Volver a la página principal
      </Link>
    </div>
  )
}
