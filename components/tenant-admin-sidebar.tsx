"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Home, LogOut, Settings, ShoppingCart, Users, User, Store } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRef } from "react"

export function TenantAdminSidebar({ tenantid }: { tenantid: string }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isLogoutRef = useRef(false)

  const links = [
    { href: `/admin/dashboard`, label: "Dashboard", icon: Home },
    { href: `/admin/profile`, label: "Perfil Personal", icon: User },
    { href: `/admin/restaurant`, label: "Datos del Local", icon: Store },
    { href: `/admin/users`, label: "Usuarios", icon: Users },
    { href: `/admin/products`, label: "Productos", icon: ShoppingCart },
    { href: `/admin/stats`, label: "Estadísticas", icon: BarChart3 },
    { href: `/admin/settings`, label: "Configuración", icon: Settings },
  ]

  const handleLogout = async () => {
    isLogoutRef.current = true // Marcar que es un cierre de sesión voluntario
    await logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push(`/login`)
  }

  return (
    <div className="w-64 bg-muted h-screen p-4 border-r flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">{tenantid}.gastroo.online</p>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
