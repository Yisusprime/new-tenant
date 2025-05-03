import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Tu plataforma SaaS con subdominios personalizados</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crea tu propio negocio SaaS con subdominios personalizados para cada cliente. Fácil de configurar, fácil
              de usar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Comenzar gratis
                </Button>
              </Link>
              <Link href="/tenants">
                <Button size="lg" variant="outline" className="px-8">
                  Ver Tenants
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Subdominios personalizados</h3>
                <p className="text-gray-600">
                  Cada cliente obtiene su propio subdominio personalizado para su restaurante.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Panel de administración</h3>
                <p className="text-gray-600">
                  Gestiona tu restaurante con un panel de administración intuitivo y fácil de usar.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Menú personalizable</h3>
                <p className="text-gray-600">Crea y personaliza el menú de tu restaurante con facilidad.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">¿Listo para comenzar?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Regístrate hoy y comienza a gestionar tu restaurante en línea.
            </p>
            <Link href="/register">
              <Button size="lg" className="px-8">
                Registrar mi restaurante
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Gastroo</h3>
              <p className="text-gray-400">Plataforma para restaurantes</p>
            </div>
            <div className="flex gap-8">
              <Link href="/caracteristicas" className="hover:text-primary">
                Características
              </Link>
              <Link href="/precios" className="hover:text-primary">
                Precios
              </Link>
              <Link href="/tenants" className="hover:text-primary">
                Tenants
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
