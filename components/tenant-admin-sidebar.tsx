"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Settings, ShoppingBag, Tag, User, Utensils, Package, CreditCard, Store, Palette } from "lucide-react"

export function TenantAdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/admin/profile",
      label: "Perfil",
      icon: User,
    },
    {
      href: "/admin/restaurant",
      label: "Restaurante",
      icon: Store,
    },
    {
      href: "/admin/categories",
      label: "Categorías",
      icon: Tag,
    },
    {
      href: "/admin/extras",
      label: "Extras",
      icon: Package,
    },
    {
      href: "/admin/products",
      label: "Productos",
      icon: ShoppingBag,
    },
    {
      href: "/admin/menu",
      label: "Menú",
      icon: Utensils,
    },
    {
      href: "/admin/inventory",
      label: "Inventario",
      icon: Package,
    },
    {
      href: "/admin/orders",
      label: "Órdenes",
      icon: ShoppingBag,
    },
    {
      href: "/admin/cashier",
      label: "Caja",
      icon: CreditCard,
    },
    {
      href: "/admin/theme",
      label: "Tema",
      icon: Palette,
    },
    {
      href: "/admin/settings",
      label: "Configuración",
      icon: Settings,
    },
  ]

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-background">
      <div className="p-6">
        <Link href="/admin/dashboard">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </Link>
      </div>
      <div className="flex flex-col w-full">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center gap-x-2 text-sm font-[500] pl-6 pr-3 py-4 hover:bg-muted/50 transition-colors ${
              pathname === route.href || pathname.startsWith(`${route.href}/`)
                ? "text-primary border-r-2 border-primary bg-muted/50"
                : ""
            }`}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
