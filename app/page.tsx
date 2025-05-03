import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Barra de navegación */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Multi-Cliente</h1>
            <nav className="ml-10 hidden md:flex space-x-6">
              <Link href="/caracteristicas" className="text-gray-600 hover:text-gray-900">
                Características
              </Link>
              <Link href="/precios" className="text-gray-600 hover:text-gray-900">
                Precios
              </Link>
              <Link href="/tenants" className="text-gray-600 hover:text-gray-900">
                Tenants
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Tu plataforma SaaS
          <br />
          con subdominios personalizados
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-2">
          Crea tu propio negocio SaaS con subdominios personalizados para cada cliente.
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">Fácil de configurar, fácil de usar.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/registro"
            className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 flex items-center justify-center"
          >
            Comenzar gratis →
          </Link>
          <Link href="/tenants" className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50">
            Ver Tenants
          </Link>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Subdominios personalizados</h3>
              <p className="text-gray-600">
                Cada cliente tiene su propio subdominio personalizado para acceder a su instancia.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Autenticación segura</h3>
              <p className="text-gray-600">
                Sistema de autenticación robusto con Firebase para garantizar la seguridad de tus datos.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Gestión de roles</h3>
              <p className="text-gray-600">
                Diferentes niveles de acceso para administradores, gerentes y usuarios regulares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes de precios */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Planes de precios</h2>
          {/* Aquí irían los planes de precios */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
