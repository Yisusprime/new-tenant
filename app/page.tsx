import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="border-b w-full">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold">
              Multi-Cliente
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/caracteristicas" className="text-sm font-medium">
                Características
              </Link>
              <Link href="/precios" className="text-sm font-medium">
                Precios
              </Link>
              <Link href="/tenants" className="text-sm font-medium">
                Tenants
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tu plataforma SaaS
              <br />
              con subdominios personalizados
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Crea tu propio negocio SaaS con subdominios personalizados para cada cliente.
              <br />
              Fácil de configurar, fácil de usar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
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
        <section className="w-full py-12 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 max-w-3xl mx-auto">
              <div className="bg-background rounded-lg border p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Información del Dominio</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">Detalles sobre el dominio actual</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Hostname:</span>
                    <span>www.gastroo.online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Es dominio de Vercel:</span>
                    <span>No</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Es subdominio:</span>
                    <span>Sí</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tenant:</span>
                    <span>www</span>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-lg border p-6">
                <h2 className="text-2xl font-bold mb-4 text-center">Probar Subdominio</h2>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Verifica si tu configuración de subdominio funciona correctamente
                </p>
                <div className="flex justify-center">
                  <span className="font-medium">Subdominio</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 w-full">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Multi-Cliente. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
