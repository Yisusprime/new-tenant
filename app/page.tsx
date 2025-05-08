import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="text-2xl font-bold">Gastroo</div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Crea tu propio sitio de restaurante</h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Gastroo te permite crear un sitio web personalizado para tu restaurante con tu propio subdominio, menú
              digital y sistema de administración.
            </p>
            <Link href="/register">
              <Button size="lg" className="px-8">
                Comenzar ahora
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Características principales</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Tu propio subdominio</h3>
                <p>Obtén un subdominio personalizado para tu restaurante (turestaurante.gastroo.online).</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Menú digital</h3>
                <p>Crea y administra fácilmente tu menú digital con categorías, productos y precios.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Panel de administración</h3>
                <p>Gestiona tu restaurante con un panel de administración intuitivo y fácil de usar.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Gastroo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
