import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import DomainInfo from "@/components/domain-info"
import TenantDomainTester from "@/components/tenant-domain-tester"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              Multi-Cliente
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/features" className="text-sm font-medium hover:underline">
                Características
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:underline">
                Precios
              </Link>
              <Link href="/tenants" className="text-sm font-medium hover:underline">
                Tenants
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
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
        <section className="py-20 md:py-32">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Tu plataforma SaaS <br /> con subdominios personalizados
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
              Crea tu propio negocio SaaS con subdominios personalizados para cada cliente. Fácil de configurar, fácil
              de usar.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Comenzar gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tenants">
                <Button variant="outline" size="lg">
                  Ver Tenants
                </Button>
              </Link>
            </div>

            {/* Añadir información del dominio */}
            <div className="mt-16 w-full max-w-md">
              <DomainInfo />
            </div>

            {/* Añadir probador de subdominios */}
            <div className="mt-8 w-full max-w-md">
              <TenantDomainTester />
            </div>
          </div>
        </section>
        <section className="py-20 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Subdominios automáticos</h3>
                <p className="text-muted-foreground">
                  Cada cliente obtiene automáticamente su propio subdominio personalizado.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Creación instantánea</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Personalización completa</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Dominios personalizados</h3>
                <p className="text-muted-foreground">
                  Permite a tus clientes usar sus propios dominios con configuración CNAME.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Configuración sencilla</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>SSL automático</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">Aislamiento de datos</h3>
                <p className="text-muted-foreground">Cada cliente tiene sus datos completamente aislados y seguros.</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Seguridad avanzada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Privacidad garantizada</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Multi-Cliente. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Términos
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
