"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, signOut } from "firebase/auth"
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
  ChevronDown,
  Store,
  Clock,
  Truck,
  CreditCardIcon as PaymentIcon,
  Globe,
  FolderTree,
  ShoppingBag,
  Table,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Maximize,
  Minimize,
} from "lucide-react"
import Link from "next/link"
import { BranchProvider, useBranch } from "@/lib/context/branch-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BranchAlertModal } from "@/components/branch-alert-modal"
import { PlanProvider, usePlan } from "@/lib/context/plan-context"
import { AuthProvider } from "@/lib/context/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

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
      <MapPin className="h-4 w-4 text-gray-200" />
      <Select
        value={currentBranch?.id}
        onValueChange={(value) => {
          const branch = branches.find((b) => b.id === value)
          if (branch) setCurrentBranch(branch)
        }}
      >
        <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
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
    free: "bg-gray-700 text-gray-200",
    basic: "bg-blue-900 text-blue-100",
    premium: "bg-purple-900 text-purple-100",
    enterprise: "bg-amber-900 text-amber-100",
  }

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${planColors[plan]}`}>
      Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </div>
  )
}

// Componente para el recordatorio de pantalla completa
function FullscreenReminder({ onDismiss }: { onDismiss: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="absolute top-16 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg shadow-lg z-50 max-w-xs"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-2">
            <Maximize className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">¿Mejor experiencia?</p>
            <p className="text-xs mt-1">Usa el modo pantalla completa para una mejor experiencia en tu dispositivo</p>
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={onDismiss}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                No mostrar más
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-2 right-6 w-4 h-4 bg-blue-600 transform rotate-45"></div>
      </motion.div>
    </AnimatePresence>
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
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // En el cliente, verificar localStorage y tamaño de pantalla
    if (typeof window !== "undefined") {
      // Si es móvil, iniciar cerrado
      if (window.innerWidth < 768) return false
      // Si hay preferencia guardada, usarla
      const saved = localStorage.getItem("sidebarOpen")
      return saved !== null ? saved === "true" : true
    }
    return true
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenReminder, setShowFullscreenReminder] = useState(false)
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [restaurantConfigOpen, setRestaurantConfigOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Función para actualizar el estado del sidebar
  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarOpen", String(newState))
    }
  }

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

  useEffect(() => {
    // Cerrar sidebar automáticamente en móvil cuando cambia la ruta
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Solo en móvil
      if (typeof window !== "undefined" && window.innerWidth < 768 && sidebarOpen) {
        const sidebar = document.getElementById("admin-sidebar")
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

  useEffect(() => {
    // Solo aplicar en dispositivos móviles
    if (typeof window === "undefined") return

    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }

    // Verificar inicialmente
    checkMobile()

    // Verificar en cambios de tamaño
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    // Solo aplicar en dispositivos móviles
    if (typeof window === "undefined" || !isMobile) return

    const controlHeader = () => {
      const currentScrollY = window.scrollY

      // Si estamos al inicio de la página, siempre mostrar el header
      if (currentScrollY < 10) {
        setHeaderVisible(true)
        setLastScrollY(currentScrollY)
        return
      }

      // Determinar dirección del scroll
      const isScrollingDown = currentScrollY > lastScrollY

      // Cambiar visibilidad basado en dirección (con un umbral mínimo de 10px)
      if (isScrollingDown && currentScrollY > lastScrollY + 10) {
        setHeaderVisible(false)
      } else if (!isScrollingDown && currentScrollY < lastScrollY - 10) {
        setHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", controlHeader)
    return () => {
      window.removeEventListener("scroll", controlHeader)
    }
  }, [lastScrollY, isMobile])

  useEffect(() => {
    // Solución para evitar que la barra de URL del navegador móvil cause problemas
    if (typeof window !== "undefined" && isMobile) {
      // Establecer altura inicial
      const setAppHeight = () => {
        const doc = document.documentElement
        doc.style.setProperty("--app-height", `${window.innerHeight}px`)
      }

      // Configurar al inicio
      setAppHeight()

      // Actualizar en cambios de orientación o redimensionamiento
      window.addEventListener("resize", setAppHeight)
      window.addEventListener("orientationchange", setAppHeight)

      return () => {
        window.removeEventListener("resize", setAppHeight)
        window.removeEventListener("orientationchange", setAppHeight)
      }
    }
  }, [isMobile])

  // Verificar si se debe mostrar el recordatorio de pantalla completa
  useEffect(() => {
    if (typeof window !== "undefined" && isMobile) {
      // Verificar si ya se ha mostrado antes
      const hasSeenReminder = localStorage.getItem("fullscreenReminderSeen")

      // Solo mostrar si:
      // 1. No se ha visto antes
      // 2. No está en modo pantalla completa
      // 3. Es un dispositivo móvil
      if (!hasSeenReminder && !isFullscreen) {
        // Mostrar el recordatorio después de un breve retraso
        const timer = setTimeout(() => {
          setShowFullscreenReminder(true)
        }, 2000)

        return () => clearTimeout(timer)
      }
    }
  }, [isFullscreen, isMobile])

  const dismissFullscreenReminder = () => {
    setShowFullscreenReminder(false)
    // Marcar como visto para no mostrarlo de nuevo
    if (typeof window !== "undefined") {
      localStorage.setItem("fullscreenReminderSeen", "true")
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Entrar en modo pantalla completa
      if (document.documentElement.requestFullscreen) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true)
            // Marcar como visto el recordatorio si está activo
            if (showFullscreenReminder) {
              dismissFullscreenReminder()
            }
          })
          .catch((err) => console.error(`Error al intentar pantalla completa: ${err.message}`))
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        // Safari
        ;(document.documentElement as any).webkitRequestFullscreen()
        setIsFullscreen(true)
        if (showFullscreenReminder) {
          dismissFullscreenReminder()
        }
      } else if ((document.documentElement as any).msRequestFullscreen) {
        // IE11
        ;(document.documentElement as any).msRequestFullscreen()
        setIsFullscreen(true)
        if (showFullscreenReminder) {
          dismissFullscreenReminder()
        }
      }
    } else {
      // Salir del modo pantalla completa
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch((err) => console.error(`Error al salir de pantalla completa: ${err.message}`))
      } else if ((document as any).webkitExitFullscreen) {
        // Safari
        ;(document as any).webkitExitFullscreen()
        setIsFullscreen(false)
      } else if ((document as any).msExitFullscreen) {
        // IE11
        ;(document as any).msExitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [])

  // Verificar si la ruta actual está activa
  const isActive = (path: string) => {
    return pathname === `/tenant/${tenantId}/admin${path}`
  }

  // Verificar si alguna ruta dentro de un grupo está activa
  const isGroupActive = (paths: string[]) => {
    return paths.some((path) => pathname.startsWith(`/tenant/${tenantId}/admin${path}`))
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

  // Menú principal reorganizado
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { type: "separator", label: "Gestión" },
    { path: "/orders", label: "Pedidos", icon: ShoppingBag },
    { path: "/cash-register", label: "Caja", icon: DollarSign },
    { path: "/products", label: "Productos", icon: Store },
    { path: "/categories", label: "Categorías", icon: FolderTree },
    { path: "/branches", label: "Sucursales", icon: MapPin },
    { type: "separator", label: "Configuración" },
    { path: "/plans", label: "Planes", icon: CreditCard },
    { type: "separator", label: "Herramientas" },
    { path: "/debug", label: "Depuración", icon: AlertCircle },
  ]

  // Submenú de configuración de usuario
  const configItems = [{ path: "/settings/profile", label: "Perfil", icon: User }]

  // Submenú de configuración del restaurante reorganizado
  const restaurantConfigItems = [
    { path: "/restaurant/basic", label: "Información Básica", icon: Store },
    { path: "/restaurant/contact", label: "Contacto", icon: User },
    { path: "/restaurant/location", label: "Ubicación", icon: MapPin },
    { path: "/restaurant/hours", label: "Horarios", icon: Clock },
    { path: "/restaurant/tables", label: "Mesas", icon: Table },
    { path: "/restaurant/service", label: "Métodos de Servicio", icon: Truck },
    { path: "/restaurant/payment", label: "Pagos", icon: PaymentIcon },
    { path: "/restaurant/delivery", label: "Delivery", icon: Truck },
    { path: "/restaurant/social", label: "Redes Sociales", icon: Globe },
  ]

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar con nuevo estilo */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700 bg-gray-800">
          <div className={`font-bold text-xl truncate text-white ${!sidebarOpen && "md:hidden"}`}>
            {tenantData?.name || tenantId}
          </div>
          {!sidebarOpen && (
            <div className="hidden md:flex justify-center w-full">
              <span className="font-bold text-xl text-white">{(tenantData?.name || tenantId).charAt(0)}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-700 text-gray-300 md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 px-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <li key={`sep-${index}`} className={`pt-2 pb-1 ${!sidebarOpen && "md:hidden"}`}>
                    <div
                      className={`px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${!sidebarOpen && "hidden"}`}
                    >
                      {item.label}
                    </div>
                    <Separator className="my-1 bg-gray-700" />
                  </li>
                )
              }
              return (
                <li key={item.path}>
                  {!sidebarOpen ? (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/admin${item.path}`}
                            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                              isActive(item.path)
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                          >
                            <item.icon className="mx-auto h-5 w-5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Link
                      href={`/admin${item.path}`}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive(item.path)
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              )
            })}

            {/* Menú desplegable de configuración de usuario */}
            <li className={!sidebarOpen ? "md:hidden" : ""}>
              <Collapsible
                open={configOpen || isGroupActive(["/settings"])}
                onOpenChange={setConfigOpen}
                className="w-full"
              >
                <CollapsibleTrigger
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors ${
                    isGroupActive(["/settings"])
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <Settings className="mr-3 h-5 w-5" />
                    <span>Configuración</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${configOpen || isGroupActive(["/settings"]) ? "transform rotate-180" : ""}`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 ml-7 space-y-1 border-l border-gray-700 pl-2">
                    {configItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          href={`/admin${item.path}`}
                          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                            pathname.includes(item.path)
                              ? "bg-gray-800 text-primary"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>

            {/* Menú desplegable de configuración del restaurante */}
            <li className={!sidebarOpen ? "md:hidden" : ""}>
              <Collapsible
                open={restaurantConfigOpen || isGroupActive(["/restaurant"])}
                onOpenChange={setRestaurantConfigOpen}
                className="w-full"
              >
                <CollapsibleTrigger
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-md transition-colors ${
                    isGroupActive(["/restaurant"])
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <Store className="mr-3 h-5 w-5" />
                    <span>Restaurante</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      restaurantConfigOpen || isGroupActive(["/restaurant"]) ? "transform rotate-180" : ""
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 ml-7 space-y-1 border-l border-gray-700 pl-2">
                    {restaurantConfigItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          href={`/admin${item.path}`}
                          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                            pathname.includes(item.path)
                              ? "bg-gray-800 text-primary"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </li>

            {!sidebarOpen && (
              <li className="hidden md:block">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/admin/settings/profile`}
                        className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                          isGroupActive(["/settings"])
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      Configuración
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            )}

            {!sidebarOpen && (
              <li className="hidden md:block">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/admin/restaurant/basic`}
                        className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                          isGroupActive(["/restaurant"])
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <Store className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      Restaurante
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            )}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700 bg-gray-800">
          {sidebarOpen ? (
            <>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2 text-white">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="truncate">
                  <div className="font-medium truncate text-white">{user?.email}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>Administrador</span>
                    <PlanBadge />
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mb-2 text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Cerrar Sesión
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>

      {/* Main content con nuevo estilo en la barra superior */}
      <div className="flex-1 flex flex-col">
        <header
          className={`bg-gradient-to-r from-gray-800 to-gray-900 shadow-md h-16 flex items-center px-4 text-white sticky top-0 z-40 transition-transform duration-300 ease-in-out ${
            headerVisible ? "translate-y-0" : "-translate-y-full md:translate-y-0"
          }`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 mr-4 rounded-md hover:bg-gray-700 text-gray-300 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={toggleSidebar}
            className="p-1 mr-4 rounded-md hover:bg-gray-700 text-gray-300 hidden md:flex"
            aria-label={sidebarOpen ? "Contraer menú" : "Expandir menú"}
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button
                ref={fullscreenButtonRef}
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className={`text-gray-300 hover:text-white hover:bg-gray-700 ${
                  showFullscreenReminder ? "animate-pulse" : ""
                }`}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </Button>

              {/* Recordatorio de pantalla completa */}
              {showFullscreenReminder && <FullscreenReminder onDismiss={dismissFullscreenReminder} />}
            </div>
            <BranchSelector />
          </div>
        </header>

        <main className="flex-1 p-4 scroll-container">
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
    <AuthProvider tenantId={params.tenantId}>
      <PlanProvider tenantId={params.tenantId}>
        <BranchProvider tenantId={params.tenantId}>
          <AdminLayoutContent params={params}>{children}</AdminLayoutContent>
        </BranchProvider>
      </PlanProvider>
    </AuthProvider>
  )
}
