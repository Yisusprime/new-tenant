import { notFound } from "next/navigation"

interface RestaurantPageProps {
  params: {
    domain: string
  }
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  // En una implementación real, aquí verificaríamos si el dominio existe en la base de datos
  // Si no existe, redirigimos a notFound()

  // Ejemplo de verificación simple (esto sería reemplazado por una consulta a la base de datos)
  const validDomains = ["restaurante1", "restaurante2", "demo"]
  if (!validDomains.includes(params.domain)) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{params.domain}</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#menu" className="text-sm font-medium hover:underline underline-offset-4">
              Menú
            </a>
            <a href="#ubicacion" className="text-sm font-medium hover:underline underline-offset-4">
              Ubicación
            </a>
            <a href="#contacto" className="text-sm font-medium hover:underline underline-offset-4">
              Contacto
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Bienvenido al portal de {params.domain}
            </h1>
            <p className="mt-4 text-gray-500 md:text-xl">
              Este es el portal personalizado para la administración de tu local de comida.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-gray-500">© 2023 {params.domain}. Powered by FoodManager.</p>
        </div>
      </footer>
    </div>
  )
}
