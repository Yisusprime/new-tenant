import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center">
            <span className="mr-1">Gastroo</span>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex gap-6 mr-6">
              <Link href="/" className="hover:text-gray-300">
                Productos
              </Link>
              <Link href="/" className="hover:text-gray-300">
                Docs
              </Link>
              <Link href="/" className="hover:text-gray-300">
                Blog
              </Link>
              <Link href="/" className="hover:text-gray-300">
                Research
              </Link>
              <Link href="/" className="hover:text-gray-300">
                Ayuda
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 mr-2">
                <span className="text-sm">Chile</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-1"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <Link href="/register" className="text-white hover:text-gray-300 text-sm">
                Iniciar sesión
              </Link>
              <Button asChild size="sm" className="bg-white text-black hover:bg-gray-200">
                <Link href="/register">Habla con ventas</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Gestiona tu Restaurante en Línea</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Plataforma completa para administrar pedidos, menús y clientes de tu restaurante con tu propio subdominio
              personalizado.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <Link href="/register">Comenzar Gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="#features">Ver Características</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Tu Propio Subdominio</h3>
                <p>Obtén un subdominio personalizado para tu restaurante (turestaurante.gastroo.online).</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Gestión de Menús</h3>
                <p>Crea y actualiza fácilmente tus menús, categorías y productos.</p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Pedidos en Línea</h3>
                <p>Recibe pedidos en línea y gestiona todo el proceso desde un solo lugar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">¿Listo para empezar?</h2>
            <Button asChild size="lg">
              <Link href="/register">Registra tu Restaurante</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="text-xl font-bold mb-2">Gastroo</div>
              <p className="text-gray-400">La plataforma para tu restaurante</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Producto</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-gray-400 hover:text-white">
                      Características
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Precios
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Soporte</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Documentación
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Contacto
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Términos
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white">
                      Privacidad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            &copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
