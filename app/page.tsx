import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/layout/main-nav"

const navItems = [
  {
    title: "Características",
    href: "/caracteristicas",
  },
  {
    title: "Precios",
    href: "/precios",
  },
  {
    title: "Tenants",
    href: "/tenants",
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems} />
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Tu plataforma SaaS con subdominios personalizados
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Crea tu propio negocio SaaS con subdominios personalizados para cada cliente. Fácil de configurar, fácil
              de usar.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/registro">Comenzar gratis</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/tenants">Ver Tenants</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Subdominios personalizados</h3>
                  <p className="text-sm text-muted-foreground">
                    Cada cliente tiene su propio subdominio personalizado para acceder a su instancia.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Autenticación segura</h3>
                  <p className="text-sm text-muted-foreground">
                    Sistema de autenticación robusto con Firebase para garantizar la seguridad de tus datos.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Gestión de roles</h3>
                  <p className="text-sm text-muted-foreground">
                    Diferentes niveles de acceso para administradores, gerentes y usuarios regulares.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Gastroo. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
