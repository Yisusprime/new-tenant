"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/firebase/client"

interface NavbarProps {
  isTenant?: boolean
  tenantName?: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
}

export function Navbar({ isTenant = false, tenantName = "", isAdmin = false, isSuperAdmin = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await logoutUser()
    window.location.href = "/"
  }

  const navItems = isSuperAdmin
    ? [
        { label: "Dashboard", href: "/superadmin/dashboard" },
        { label: "Tenants", href: "/superadmin/tenants" },
      ]
    : isTenant && isAdmin
      ? [
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Menú", href: "/admin/menu" },
          { label: "Pedidos", href: "/admin/orders" },
          { label: "Configuración", href: "/admin/settings" },
        ]
      : isTenant
        ? [
            { label: "Inicio", href: "/" },
            { label: "Menú", href: "/menu" },
            { label: "Contacto", href: "/contact" },
          ]
        : [
            { label: "Inicio", href: "/" },
            { label: "Características", href: "/caracteristicas" },
            { label: "Precios", href: "/precios" },
            { label: "Tenants", href: "/tenants" },
          ]

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                {isTenant ? `${tenantName || "Restaurante"}` : "Gastroo"}
                {isSuperAdmin && " SuperAdmin"}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAdmin || isSuperAdmin ? (
              <Button variant="ghost" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  pathname === item.href
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {isAdmin || isSuperAdmin ? (
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                  Cerrar Sesión
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 w-full px-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start">Registrarse</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
