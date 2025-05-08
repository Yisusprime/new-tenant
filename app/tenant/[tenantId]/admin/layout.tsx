"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut, Menu, X, Home, MapPin, AlertCircle, CreditCard, Settings, User, ChevronDown } from "lucide-react"
import Link from "next/link"
import { BranchProvider, useBranch } from "@/lib/context/branch-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BranchAlertModal } from "@/components/branch-alert-modal"
import { PlanProvider, usePlan } from "@/lib/context/plan-context"

// Componente para el selector de sucursales
function BranchSelector() {
  const { branches, currentBranch, setCurrentBranch, loading, error, hasActiveBranches } = useBranch()

  if (loading) return <Skeleton className="h-9 w-[180px]" />

  if (error) {
    return <div className="text-sm text-red-600 bg-red-100 px-3 py-2 rounded-md">Error: {error}</div>
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="text-sm text-yellow-600 bg-yellow-100 px-3 py-2 rounded-md flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        No hay sucursales
      </div>
    )
  }

  if (!hasActiveBranches) {
    return (
      <div className="text-sm text-yellow-600 bg-yellow-100 px-3 py-2 rounded-md flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        No hay sucursales activas
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-gray-500" />
      <Select
        value={currentBranch?.id}
        onValueChange={(value) => {
          const branch = branches.find((b) => b.id === value)
          if (branch) setCurrentBranch(branch)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Seleccionar sucursal" />
        </SelectTrigger>
        <SelectContent>
          {branches
            .filter((branch) => branch.isActive) // Solo mostrar sucursales activas
            .map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Componente para mostrar el plan actual
function PlanBadge() {
  const { plan, isLoading } = usePlan()

  if (isLoading) return <Skeleton className="h-6 w-16" />

  const planColors = {
    free: "bg-gray-100 text-gray-800",
    basic: "bg-blue-100 text-blue-800",
    premium: "bg-purple-100 text-purple-800",
    enterprise: "bg-amber-100 text-amber-800",
  }

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${planColors[plan]}`}>
      Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </div>
  )
}

// Componente principal del layout
function AdminLayoutContent({
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
    if (path.startsWith("/settings/")) {
      // Para subpaths de settings, verificar si la ruta actual contiene el path específico
      return pathname === `/tenant/${tenantId}/admin${path}`
    }
    return pathname === `/tenant/${tenantId}/admin${path}`
  }

  // Añadir el ítem de planes al menú
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/branches", label: "Sucursales", icon: MapPin },
    { path: "/plans", label: "Planes", icon: CreditCard },
    { path: "/debug", label: "Depuración", icon: AlertCircle },
  ]

  // Nuevo menú de configuración con submenús
  const settingsMenu = {
    label: "Configuración",
    icon: Settings,
    subItems: [
      { path: "/settings/profile", label: "Perfil", icon: User },
      // Aquí puedes añadir más opciones de configuración
    ],
  }

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

            {/* Dropdown de configuración */}
            <li>
              <details className="group">
                <summary
                  className={`flex cursor-pointer items-center justify-between px-4 py-2 rounded-md transition-colors hover:bg-gray-100 ${
                    pathname.includes("/admin/settings") ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <settingsMenu.icon className="mr-3 h-5 w-5" />
                    {settingsMenu.label}
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-1 space-y-1 pl-8">
                  {settingsMenu.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        href={`/admin${subItem.path}`}
                        className={`flex items-center px-4 py-2 rounded-md text-sm transition-colors ${
                          isActive(subItem.path) ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                        }`}
                      >
                        <subItem.icon className="mr-3 h-4 w-4" />
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <div className="font-medium truncate">{user?.email}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>Administrador</span>
                <PlanBadge />
              </div>
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
          <div className="ml-auto">
            <BranchSelector />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          {/* Añadir el modal de alerta en lugar de la alerta normal */}
          <BranchAlertModal />
          {children}
        </main>
      </div>
    </div>
  )
}

// Wrapper que proporciona el contexto de sucursales y plan
export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { tenantId: string }
}) {
  return (
    <PlanProvider tenantId={params.tenantId}>
      <BranchProvider tenantId={params.tenantId}>
        <AdminLayoutContent params={params}>{children}</AdminLayoutContent>
      </BranchProvider>
    </PlanProvider>
  )
}
