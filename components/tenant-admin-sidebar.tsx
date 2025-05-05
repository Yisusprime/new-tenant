"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Home,
  LogOut,
  Settings,
  Users,
  User,
  Store,
  Menu,
  List,
  Coffee,
  Plus,
  Package,
  ShoppingBag,
  DollarSign,
  Palette,
  CalendarDays,
  MessageSquare,
  Bell,
  FileText,
  Truck,
  Utensils,
  Clock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRef } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function TenantAdminSidebar({ tenantid }: { tenantid: string }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isLogoutRef = useRef(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [scrollbarHideStyles, setScrollbarHideStyles] = useState(`
  /* Estilos para ocultar la barra de desplazamiento pero mantener la funcionalidad */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`)

  // Detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    // Comprobar al cargar
    checkIsMobile()

    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkIsMobile)

    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  // Enlaces organizados por categorías
  const linkGroups = [
    {
      title: "Principal",
      links: [
        { href: `/admin/dashboard`, label: "Dashboard", icon: Home },
        { href: `/admin/profile`, label: "Perfil Personal", icon: User },
        { href: `/admin/restaurant`, label: "Datos del Local", icon: Store },
      ],
    },
    {
      title: "Menú",
      links: [
        { href: `/admin/categories`, label: "Categorías", icon: List },
        { href: `/admin/products`, label: "Productos", icon: Coffee },
        { href: `/admin/extras`, label: "Extras", icon: Plus },
      ],
    },
    {
      title: "Operaciones",
      links: [
        { href: `/admin/orders`, label: "Pedidos", icon: ShoppingBag },
        { href: `/admin/inventory`, label: "Inventario", icon: Package },
        { href: `/admin/cashier`, label: "Caja", icon: DollarSign },
        { href: `/admin/reservations`, label: "Reservas", icon: CalendarDays },
        { href: `/admin/delivery`, label: "Entregas", icon: Truck },
        { href: `/admin/kitchen`, label: "Cocina", icon: Utensils },
        { href: `/admin/shifts`, label: "Turnos", icon: Clock },
      ],
    },
    {
      title: "Marketing",
      links: [
        { href: `/admin/theme`, label: "Personalización", icon: Palette },
        { href: `/admin/promotions`, label: "Promociones", icon: Bell },
        { href: `/admin/reviews`, label: "Reseñas", icon: MessageSquare },
      ],
    },
    {
      title: "Administración",
      links: [
        { href: `/admin/users`, label: "Usuarios", icon: Users },
        { href: `/admin/stats`, label: "Estadísticas", icon: BarChart3 },
        { href: `/admin/reports`, label: "Informes", icon: FileText },
        { href: `/admin/settings`, label: "Configuración", icon: Settings },
      ],
    },
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">{tenantid}.gastroo.online</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {linkGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2 px-3">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.links.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/10"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )

  // Versión móvil con Sheet
  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-40 lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="w-64 p-4">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Versión desktop
  return (
    <div className="hidden lg:flex w-64 bg-muted h-screen p-4 border-r flex-col overflow-y-auto">
      <SidebarContent />
    </div>
  )

  // Agregar un estilo global para aplicar estos estilos
  useEffect(() => {
    // Crear elemento de estilo
    const style = document.createElement("style")
    style.textContent = scrollbarHideStyles
    // Añadir al head
    document.head.appendChild(style)

    // Limpiar al desmontar
    return () => {
      document.head.removeChild(style)
    }
  }, [scrollbarHideStyles])
}
