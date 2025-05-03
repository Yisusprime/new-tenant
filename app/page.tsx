import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-xl">Multi-Cliente</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#caracteristicas" className="text-sm font-medium transition-colors hover:text-primary">
              Características
            </Link>
            <Link href="#precios" className="text-sm font-medium transition-colors hover:text-primary">
              Precios
            </Link>
            <Link href="/tenants" className="text-sm font-medium transition-colors hover:text-primary">
              Tenants
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Tu plataforma SaaS
                <br />
                con subdominios personalizados
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Crea tu propio negocio SaaS con subdominios personalizados para cada cliente.
                <br />
                Fácil de configurar, fácil de usar.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
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
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800" id="caracteristicas">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Características</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Todo lo que necesitas para gestionar tu plataforma multi-cliente
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Subdominios personalizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cada cliente tiene su propio subdominio personalizado (cliente.gastroo.online)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Base de datos Firebase</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Almacenamiento seguro y escalable con Firebase Cloud Firestore</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Autenticación integrada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sistema de autenticación completo con Firebase Auth</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
