import { LoginForm } from "@/components/auth/login-form"
import { MainNav } from "@/components/layout/main-nav"

const navItems = [
  {
    title: "Inicio",
    href: "/",
  },
  {
    title: "Características",
    href: "/caracteristicas",
  },
  {
    title: "Precios",
    href: "/precios",
  },
]

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems} />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h1>
          <LoginForm redirectUrl="/dashboard" />
        </div>
      </main>
    </div>
  )
}
