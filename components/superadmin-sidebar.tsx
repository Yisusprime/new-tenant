"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Building2, Home, Settings, Users } from "lucide-react"

export function SuperAdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/superadmin/dashboard", label: "Dashboard", icon: Home },
    { href: "/superadmin/tenants", label: "Tenants", icon: Building2 },
    { href: "/superadmin/users", label: "Usuarios", icon: Users },
    { href: "/superadmin/stats", label: "Estadísticas", icon: BarChart3 },
    { href: "/superadmin/settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="w-64 bg-muted h-screen p-4 border-r">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Super Admin</h2>
        <p className="text-sm text-muted-foreground">Panel de control</p>
      </div>

      <nav className="space-y-1">
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
    </div>
  )
}
