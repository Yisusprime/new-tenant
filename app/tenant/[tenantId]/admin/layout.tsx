"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LogOut,
  Menu,
  X,
  Home,
  MapPin,
  AlertCircle,
  CreditCard,
  Settings,
  User,
  Shield,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { BranchProvider, useBranch } from "@/lib/context/branch-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BranchAlertModal } from "@/components/branch-alert-modal"
import { PlanProvider, usePlan } from "@/lib/context/plan-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/context/auth-context"

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
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirectToLogin, setRedirectToLogin] = useState(false)

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/branches", label: "Sucursales", icon: MapPin },
    { path: "/products", label: "Productos", icon: AlertCircle },
    { path: "/plans", label: "Planes", icon: CreditCard },
  ]

  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    console.log("AdminLayout auth state:", { user: user?.uid, loading: authLoading, error: authError })

    async function checkPermissions() {
      if (!user) return

      try {
        // Verificar si el usuario es administrador
        const roleDoc = await getDoc(doc(db, `tenants/${tenantId}/roles`, user.uid))

        if (roleDoc.exists() && roleDoc.data().role === "admin") {
          setIsAdmin(true)
        } else {
          setError("No tienes permisos de administrador para este tenant")
        }

        // Obtener datos del tenant
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists()) {
          setTenantData(tenantDoc.data())
        } else {
          setError("El tenant no existe")
        }
      } catch (err) {
        console.error("Error verificando permisos:", err)
        setError("Error al verificar permisos")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      if (user) {
        checkPermissions()
      } else {
        setLoading(false)
        setRedirectToLogin(true)
      }
    }
  }, [user, authLoading, tenantId, authError])

  useEffect(() => {
    if (redirectToLogin) {
      router.push(`/tenant/${tenantId}/login`)
    }
  }, [redirectToLogin, router, tenantId])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push(`/tenant/${tenantId}/login`)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Verificar si la ruta actual está activa
  const isActive = (path: string) => {
    return pathname === `/tenant/${tenantId}/admin${path}`
  }

  // If auth is still loading, show a loading skeleton
  if (authLoading) {
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

  // If there's an auth error, show it
  if (authError) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error de autenticación</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{authError}</p>
              <p>Intenta recargar la página o iniciar sesión nuevamente.</p>
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} className="flex-1">
              Recargar página
            </Button>
            <Button variant="outline" onClick={() => router.push(`/tenant/${tenantId}/login`)} className="flex-1">
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If no user after auth loading is complete, redirect to login
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="mb-6">Debes iniciar sesión para acceder al panel de administración.</p>
          <Button asChild>
            <Link href={`/tenant/${tenantId}/login`}>Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  // If still checking permissions, show loading
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

  // If there's an error or user is not admin, show access denied
  if (error || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="mb-6">{error || "No tienes permisos para acceder al panel de administración."}</p>
          <Button asChild>
            <Link href={`/tenant/${tenantId}`}>Volver al Inicio</Link>
          </Button>
        </div>
      </div>
    )
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

            {/* Settings Collapsible Section */}
            <li>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors hover:bg-gray-100`}
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-5 w-5" />
                  Configuración
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
              </button>

              {settingsOpen && (
                <ul className="mt-1 ml-4 space-y-1 border-l pl-4">
                  <li>
                    <Link
                      href="/admin/settings/profile"
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive("/settings/profile") ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                      }`}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Perfil
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/settings/account"
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive("/settings/account") ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                      }`}
                    >
                      <Shield className="mr-3 h-4 w-4" />
                      Cuenta
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <Link
                href="/admin/debug"
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive("/debug") ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                }`}
              >
                <AlertCircle className="mr-3 h-5 w-5" />
                Depuración
              </Link>
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
