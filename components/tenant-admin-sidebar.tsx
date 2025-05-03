"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Settings, ShoppingCart, Users } from "lucide-react"

export function TenantAdminSidebar({ tenantid }: { tenantid: string }) {
  const pathname = usePathname()

  const links = [
    { href: `/${tenantid}/admin/dashboard`, label: "Dashboard", icon: Home },
    { href: `/${tenantid}/admin/users`, label: "Usuarios", icon: Users },
    { href: `/${tenantid}/admin/products`, label: "Productos", icon: ShoppingCart },
    { href: `/${tenantid}/admin/stats`, label: "Estadísticas", icon: BarChart3 },
    { href: `/${tenantid}/admin/settings`, label: "Configuración", icon: Settings },
  ]

  return (
    <div className="w-64 bg-muted h-screen p-4 border-r">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">{tenantid}.gastroo.online</p>
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
