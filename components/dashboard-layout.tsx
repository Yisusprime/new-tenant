"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Globe,
  Utensils,
  ShoppingBag,
  Calendar,
  Package,
  User,
  Home,
  Building,
  Database,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      console.log("Usuario cerró sesión correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Definir navegación según el rol del usuario
  const getNavigation = () => {
    const role = userProfile?.role || "user"

    switch (role) {
      case "superadmin":
        return [
          { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
          { name: "Restaurantes", href: "/superadmin/tenants", icon: Building },
          { name: "Usuarios", href: "/superadmin/users", icon: Users },
          { name: "Dominios", href: "/superadmin/domains", icon: Globe },
          { name: "Base de Datos", href: "/superadmin/database", icon: Database },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Tenants", href: "/admin/tenants", icon: Users },
          { name: "Dominios", href: "/admin/domains", icon: Globe },
          { name: "Sistema", href: "/admin/system", icon: Settings },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      case "manager":
        return [
          { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
          { name: "Pedidos", href: "/manager/orders", icon: ShoppingBag },
          { name: "Menú", href: "/manager/menu", icon: Utensils },
          { name: "Empleados", href: "/manager/employees", icon: Users },
          { name: "Horarios", href: "/manager/schedule", icon: Calendar },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      case "waiter":
        return [
          { name: "Dashboard", href: "/waiter/dashboard", icon: LayoutDashboard },
          { name: "Mesas", href: "/waiter/tables", icon: Utensils },
          { name: "Pedidos", href: "/waiter/orders", icon: ShoppingBag },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      case "delivery":
        return [
          { name: "Dashboard", href: "/delivery/dashboard", icon: LayoutDashboard },
          { name: "Mis Entregas", href: "/delivery/deliveries", icon: Package },
          { name: "Historial", href: "/delivery/history", icon: Calendar },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      case "client":
        return [
          { name: "Dashboard", href: "/client/dashboard", icon: Home },
          { name: "Menú", href: "/client/menu", icon: Utensils },
          { name: "Mis Pedidos", href: "/client/orders", icon: ShoppingBag },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
      default:
        return [
          { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
          { name: "Mi Perfil", href: "/settings", icon: User },
        ]
    }
  }

  const navigation = getNavigation()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background">
            <div className="flex flex-col p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="font-bold text-xl">
                  Multi-Cliente
                </Link>
              </div>
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}

                <Button
                  variant="ghost"
                  className="flex items-center justify-start space-x-2 px-3 py-2 w-full"
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesión</span>
                </Button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/" className="font-bold text-xl">
              Multi-Cliente
            </Link>
          </div>
          <div className="flex-1 flex flex-col justify-between py-6 px-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-6">
              <Button
                variant="ghost"
                className="flex items-center justify-start space-x-2 px-3 py-2 w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
