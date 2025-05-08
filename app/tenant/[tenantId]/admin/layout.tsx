"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, Menu, X, Home, ShoppingBag, Users, Settings, BarChart2 } from "lucide-react"
import Link from "next/link"

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          // Verificar si el usuario es administrador
          const roleDoc = await getDoc(doc(db, `tenants/${tenantId}/roles`, currentUser.uid))

          if (roleDoc.exists() && roleDoc.data().role === "admin") {
            setIsAdmin(true)
          }

          // Obtener datos del tenant
          const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
          if (tenantDoc.exists()) {
            setTenantData(tenantDoc.data())
          }
        } catch (error) {
          console.error("Error verificando permisos:", error)
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [tenantId])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Verificar si la ruta actual está activa
  const isActive = (path: string) => {
    return pathname === `/tenant/${tenantId}/admin${path}`
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Skeleton className="h-full w-64" />
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirigir a la página de login
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="mb-6">No tienes permisos para acceder al panel de administración.</p>
          <Button asChild>
            <a href="/">Volver al Inicio</a>
          </Button>
        </div>
      </div>
    )
  }

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/products", label: "Productos", icon: ShoppingBag },
    { path: "/orders", label: "Pedidos", icon: BarChart2 },
    { path: "/customers", label: "Clientes", icon: Users },
    { path: "/settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="font-bold text-xl truncate">{tenantData?.name || tenantId}</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-200 md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={`/admin${item.path}`}
                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive(item.path) ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <div className="font-medium truncate">{user?.email}</div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
          </div>
          <Button variant="outline" className="w-full flex items-center justify-center" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 mr-4 rounded-md hover:bg-gray-200 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
