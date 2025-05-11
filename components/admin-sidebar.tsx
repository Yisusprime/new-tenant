"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingBag, Settings, MenuIcon, X, Layers, Store, CreditCard, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Páginas donde el sidebar debe estar oculto por defecto
const HIDDEN_SIDEBAR_PATHS = ["/tenant/[tenantId]/admin/orders"]

interface AdminSidebarProps {
  tenantId: string
}

export function AdminSidebar({ tenantId }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Determinar si el sidebar debe estar oculto por defecto en esta ruta
  const shouldHideByDefault = HIDDEN_SIDEBAR_PATHS.some((path) =>
    pathname.includes(path.replace("[tenantId]", tenantId)),
  )

  // Estado para controlar si el sidebar está visible en escritorio
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(!shouldHideByDefault)

  // Cerrar el sidebar móvil cuando cambia la ruta
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Función para probar el sonido
  const testSound = () => {
    try {
      // Crear múltiples elementos de audio con diferentes formatos
      const audioFormats = [
        { src: "/sounds/new-order.mp3", type: "audio/mp3" },
        { src: "/sounds/new-order.wav", type: "audio/wav" },
        { src: "/sounds/new-order.ogg", type: "audio/ogg" },
      ]

      // Intentar reproducir cada formato hasta que uno funcione
      const playNextFormat = (index = 0) => {
        if (index >= audioFormats.length) {
          console.error("No se pudo reproducir ningún formato de audio")
          alert("Error: No se pudo reproducir el sonido. Verifique que su navegador permite la reproducción de audio.")
          return
        }

        const audio = new Audio(audioFormats[index].src)

        audio.oncanplaythrough = () => {
          audio
            .play()
            .then(() => console.log("Reproduciendo audio:", audioFormats[index].src))
            .catch((err) => {
              console.error("Error al reproducir:", err)
              playNextFormat(index + 1)
            })
        }

        audio.onerror = () => {
          console.error("Error al cargar:", audioFormats[index].src)
          playNextFormat(index + 1)
        }

        // Establecer un tiempo límite para la carga
        setTimeout(() => {
          if (audio.readyState < 3) {
            // HAVE_FUTURE_DATA
            playNextFormat(index + 1)
          }
        }, 2000)
      }

      playNextFormat()
    } catch (error) {
      console.error("Error al reproducir sonido:", error)
      alert("Error al reproducir sonido: " + error.message)
    }
  }

  const menuItems = [
    {
      href: `/tenant/${tenantId}/admin/dashboard`,
      icon: <Home className="h-5 w-5" />,
      title: "Dashboard",
    },
    {
      href: `/tenant/${tenantId}/admin/orders`,
      icon: <ShoppingBag className="h-5 w-5" />,
      title: "Órdenes",
    },
    {
      href: `/tenant/${tenantId}/admin/products`,
      icon: <Package className="h-5 w-5" />,
      title: "Productos",
    },
    {
      href: `/tenant/${tenantId}/admin/categories`,
      icon: <Layers className="h-5 w-5" />,
      title: "Categorías",
    },
    {
      href: `/tenant/${tenantId}/admin/restaurant`,
      icon: <Store className="h-5 w-5" />,
      title: "Restaurante",
    },
    {
      href: `/tenant/${tenantId}/admin/branches`,
      icon: <Store className="h-5 w-5" />,
      title: "Sucursales",
    },
    {
      href: `/tenant/${tenantId}/admin/plans`,
      icon: <CreditCard className="h-5 w-5" />,
      title: "Planes",
    },
    {
      href: `/tenant/${tenantId}/admin/settings/profile`,
      icon: <Settings className="h-5 w-5" />,
      title: "Configuración",
    },
  ]

  return (
    <>
      {/* Botón de menú móvil - siempre visible en móvil */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} aria-label="Abrir menú">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Botón de toggle para escritorio - solo visible en rutas específicas */}
      {shouldHideByDefault && (
        <div className="fixed top-4 left-4 z-40 hidden md:block">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDesktopSidebarVisible((prev) => !prev)}
            aria-label={isDesktopSidebarVisible ? "Ocultar menú" : "Mostrar menú"}
          >
            {isDesktopSidebarVisible ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {/* Overlay para móvil - solo visible cuando el sidebar está abierto */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar para móvil */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Administración</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500",
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}

          <div className="pt-4 border-t mt-4">
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={testSound}>
              <Volume2 className="h-4 w-4" />
              Probar sonido
            </Button>
          </div>
        </nav>
      </aside>

      {/* Sidebar para escritorio */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out hidden md:block",
          isDesktopSidebarVisible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Administración</h2>
          {!shouldHideByDefault && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarVisible(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100",
                pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500",
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}

          <div className="pt-4 border-t mt-4">
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={testSound}>
              <Volume2 className="h-4 w-4" />
              Probar sonido
            </Button>
          </div>
        </nav>
      </aside>

      {/* Espaciador para el contenido principal cuando el sidebar está visible en escritorio */}
      <div className={cn("hidden md:block transition-all duration-300", isDesktopSidebarVisible ? "ml-64" : "ml-0")} />
    </>
  )
}
