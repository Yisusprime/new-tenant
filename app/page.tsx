import Link from "next/link"
import { ArrowRight, UtensilsCrossed, Users, Store, BarChart4 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            <span className="text-xl font-bold">FoodManager</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Características
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Precios
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Administra tus locales de comida con facilidad
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Una plataforma completa para gestionar todos tus restaurantes desde un solo lugar, con subdominios
                  personalizados para cada local.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-1">
                    Comenzar ahora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline">
                    Ver demostración
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                alt="Dashboard Preview"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                src="/restaurant-dashboard-interface.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Características</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Todo lo que necesitas para tu negocio</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nuestra plataforma ofrece todas las herramientas necesarias para administrar eficientemente tus locales
                de comida.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-gray-100 p-3">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Gestión de Locales</h3>
              <p className="text-center text-gray-500">
                Administra múltiples locales desde una sola plataforma con subdominios personalizados para cada uno.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-gray-100 p-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Gestión de Personal</h3>
              <p className="text-center text-gray-500">
                Controla horarios, roles y permisos de tu personal en cada local de manera eficiente.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-gray-100 p-3">
                <BarChart4 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Análisis y Reportes</h3>
              <p className="text-center text-gray-500">
                Obtén estadísticas detalladas y reportes personalizados para tomar mejores decisiones de negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-white px-3 py-1 text-sm">Precios</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Planes simples y transparentes</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Elige el plan que mejor se adapte a las necesidades de tu negocio.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Básico</h3>
                <p className="text-gray-500">Para pequeños negocios con un solo local.</p>
              </div>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-3xl font-bold">$29</span>
                <span className="ml-1 text-xl font-semibold">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">1 local</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">5 usuarios</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Reportes básicos</span>
                </li>
              </ul>
              <Button className="mt-8">Comenzar</Button>
            </div>
            <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm relative">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Popular
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Profesional</h3>
                <p className="text-gray-500">Para negocios en crecimiento con múltiples locales.</p>
              </div>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-3xl font-bold">$79</span>
                <span className="ml-1 text-xl font-semibold">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Hasta 5 locales</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">20 usuarios</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Reportes avanzados</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Soporte prioritario</span>
                </li>
              </ul>
              <Button className="mt-8">Comenzar</Button>
            </div>
            <div className="flex flex-col rounded-lg border bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Empresarial</h3>
                <p className="text-gray-500">Para cadenas de restaurantes con múltiples locales.</p>
              </div>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-3xl font-bold">$199</span>
                <span className="ml-1 text-xl font-semibold">/mes</span>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Locales ilimitados</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Usuarios ilimitados</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Reportes personalizados</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">API personalizada</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3">Soporte 24/7</span>
                </li>
              </ul>
              <Button className="mt-8">Contactar ventas</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Testimonios</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que dicen nuestros clientes</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Descubre cómo nuestra plataforma ha ayudado a otros negocios a crecer y prosperar.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col rounded-lg border p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="48"
                  src="/diverse-group.png"
                  style={{
                    aspectRatio: "48/48",
                    objectFit: "cover",
                  }}
                  width="48"
                />
                <div>
                  <h3 className="text-lg font-bold">Carlos Rodríguez</h3>
                  <p className="text-sm text-gray-500">Dueño de La Parrilla Gourmet</p>
                </div>
              </div>
              <p className="mt-4 text-gray-500">
                "Desde que implementamos FoodManager, la administración de nuestros 3 locales se ha vuelto mucho más
                eficiente. Ahora puedo ver el rendimiento de cada local en tiempo real."
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="48"
                  src="/diverse-woman-portrait.png"
                  style={{
                    aspectRatio: "48/48",
                    objectFit: "cover",
                  }}
                  width="48"
                />
                <div>
                  <h3 className="text-lg font-bold">María González</h3>
                  <p className="text-sm text-gray-500">Gerente de Café del Centro</p>
                </div>
              </div>
              <p className="mt-4 text-gray-500">
                "La gestión de personal y los horarios nunca había sido tan fácil. Además, los subdominios
                personalizados nos dan una imagen más profesional frente a nuestros clientes."
              </p>
            </div>
            <div className="flex flex-col rounded-lg border p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="48"
                  src="/thoughtful-man.png"
                  style={{
                    aspectRatio: "48/48",
                    objectFit: "cover",
                  }}
                  width="48"
                />
                <div>
                  <h3 className="text-lg font-bold">Javier López</h3>
                  <p className="text-sm text-gray-500">Director de Operaciones de Sabor Express</p>
                </div>
              </div>
              <p className="mt-4 text-gray-500">
                "Con 15 locales en diferentes ciudades, necesitábamos una solución escalable. FoodManager nos ha
                permitido centralizar toda la información y tomar mejores decisiones estratégicas."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comienza a administrar tus locales hoy mismo
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Únete a cientos de negocios que ya están optimizando su operación con nuestra plataforma.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-1">
                  Registrarse gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground">
                  Contactar ventas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-100">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6" />
              <span className="text-xl font-bold">FoodManager</span>
            </div>
            <p className="text-sm text-gray-500">© 2023 FoodManager. Todos los derechos reservados.</p>
          </div>
          <nav className="flex flex-wrap gap-4 md:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Términos
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Privacidad
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4">
              Cookies
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="#" className="rounded-full bg-gray-200 p-2 hover:bg-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 5.16c-.94.42-1.95.7-3 .82 1.08-.64 1.91-1.66 2.3-2.87-1.01.6-2.13 1.03-3.32 1.27-1.95-2.06-5.23-2.15-7.29-.2-1.35 1.27-1.92 3.17-1.49 4.97-4.14-.21-7.82-2.18-10.27-5.38-1.31 2.26-.65 5.17 1.53 6.62-.8-.02-1.58-.24-2.27-.64v.06c0 2.36 1.67 4.33 3.9 4.78-.74.2-1.52.23-2.27.08.65 2.02 2.5 3.39 4.63 3.43-1.75 1.37-3.94 2.11-6.16 2.11-.4 0-.8-.02-1.19-.07 2.26 1.45 4.92 2.23 7.62 2.23 9.14 0 14.14-7.57 14.14-14.14v-.64c.97-.7 1.81-1.57 2.48-2.56z"></path>
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="rounded-full bg-gray-200 p-2 hover:bg-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="rounded-full bg-gray-200 p-2 hover:bg-gray-300">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
