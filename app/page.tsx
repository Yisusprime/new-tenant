import Link from "next/link"
import FirebaseStatus from "@/components/firebase-status"
import EnvSetupGuide from "@/components/env-setup-guide"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Multi-Cliente</h1>
            <nav className="ml-8 hidden md:block">
              <ul className="flex space-x-4">
                <li>
                  <Link href="#caracteristicas" className="hover:text-blue-600">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#precios" className="hover:text-blue-600">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/tenants" className="hover:text-blue-600">
                    Tenants
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-blue-600">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Tu plataforma SaaS
              <br />
              con subdominios personalizados
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Crea tu propio negocio SaaS con subdominios personalizados para cada cliente.
              <br />
              Fácil de configurar, fácil de usar.
            </p>
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/registro" className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
                Comenzar gratis →
              </Link>
              <Link href="/tenants" className="rounded border border-gray-300 px-6 py-3 hover:bg-gray-50">
                Ver Tenants
              </Link>
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Características principales</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Subdominios personalizados</h3>
                <p className="text-gray-600">
                  Cada cliente tiene su propio subdominio personalizado para acceder a su instancia.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Autenticación segura</h3>
                <p className="text-gray-600">
                  Sistema de autenticación robusto con Firebase para garantizar la seguridad de tus datos.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-3 text-xl font-semibold">Gestión de roles</h3>
                <p className="text-gray-600">
                  Diferentes niveles de acceso para administradores, gerentes y usuarios regulares.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="precios" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Planes de precios</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Básico</h3>
                <p className="mb-4 text-3xl font-bold">
                  $9<span className="text-sm font-normal text-gray-600">/mes</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li>1 subdominio</li>
                  <li>5 usuarios</li>
                  <li>Soporte por email</li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full rounded border border-black bg-white py-2 text-center hover:bg-gray-50"
                >
                  Comenzar
                </Link>
              </div>
              <div className="rounded-lg border border-blue-500 p-6 shadow-md">
                <div className="mb-4 -mt-6 rounded-full bg-blue-500 px-3 py-1 text-center text-sm text-white w-fit mx-auto">
                  Popular
                </div>
                <h3 className="mb-2 text-xl font-semibold">Profesional</h3>
                <p className="mb-4 text-3xl font-bold">
                  $29<span className="text-sm font-normal text-gray-600">/mes</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li>5 subdominios</li>
                  <li>20 usuarios</li>
                  <li>Soporte prioritario</li>
                  <li>Funciones avanzadas</li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full rounded bg-black py-2 text-center text-white hover:bg-gray-800"
                >
                  Comenzar
                </Link>
              </div>
              <div className="rounded-lg border p-6">
                <h3 className="mb-2 text-xl font-semibold">Empresarial</h3>
                <p className="mb-4 text-3xl font-bold">
                  $99<span className="text-sm font-normal text-gray-600">/mes</span>
                </p>
                <ul className="mb-6 space-y-2">
                  <li>Subdominios ilimitados</li>
                  <li>Usuarios ilimitados</li>
                  <li>Soporte 24/7</li>
                  <li>Todas las funciones</li>
                  <li>API personalizada</li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full rounded border border-black bg-white py-2 text-center hover:bg-gray-50"
                >
                  Contactar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-center text-2xl font-bold">Estado del Sistema</h2>
            <FirebaseStatus />
            <EnvSetupGuide />
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 Multi-Cliente. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
