import { LoginForm } from "@/components/auth/login-form"
import { MainNav } from "@/components/layout/main-nav"

const navItems = [
  {
    title: "Inicio",
    href: "/",
  },
]

export default function SuperAdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={navItems} />
        </div>
      </header>
      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">SuperAdmin - Iniciar sesión</h1>
          <LoginForm redirectUrl="/superadmin/dashboard" />
        </div>
      </main>
    </div>
  )
}
