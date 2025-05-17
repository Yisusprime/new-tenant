"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BranchSelector } from "@/components/branch-selector"
import {
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Store,
  Tag,
  Users,
} from "lucide-react"
import { useBranch } from "@/lib/context/branch-context"
import { getPendingVerificationMovements } from "@/lib/services/cash-register-service"

interface AdminLayoutProps {
  children: React.ReactNode
  params: { tenantId: string }
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const { tenantId } = params
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { currentBranch } = useBranch()
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0)

  // Cargar conteo de pagos pendientes
  useEffect(() => {
    const loadPendingPayments = async () => {
      if (!currentBranch) return

      try {
        const pendingMovements = await getPendingVerificationMovements(tenantId, currentBranch.id)
        setPendingPaymentsCount(pendingMovements.length)
      } catch (error) {
        console.error("Error al cargar pagos pendientes:", error)
      }
    }

    loadPendingPayments()

    // Configurar un intervalo para actualizar cada 5 minutos
    const interval = setInterval(loadPendingPayments, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tenantId, currentBranch])

  const isActive = (path: string) => {
    return pathname?.startsWith(`/tenant/${tenantId}/admin/${path}`)
  }

  const isSettingsActive = () => {
    return pathname?.includes(`/tenant/${tenantId}/admin/settings`)
  }

  const navigation = [
    {
      name: "Dashboard",
      href: `/tenant/${tenantId}/admin/dashboard`,
      icon: LayoutDashboard,
      active: pathname === `/tenant/${tenantId}/admin/dashboard`,
    },
    {
      name: "Pedidos",
      href: `/tenant/${tenantId}/admin/orders`,
      icon: ClipboardList,
      active: isActive("orders"),
    },
    {
      name: "Caja",
      href: `/tenant/${tenantId}/admin/cash-register`,
      icon: CircleDollarSign,
      active: isActive("cash-register"),
      submenu: [
        {
          name: "Estado de Caja",
          href: `/tenant/${tenantId}/admin/cash-register`,
          active: pathname === `/tenant/${tenantId}/admin/cash-register`,
        },
        {
          name: "Historial",
          href: `/tenant/${tenantId}/admin/cash-register/history`,
          active: pathname === `/tenant/${tenantId}/admin/cash-register/history`,
        },
        {
          name: "Pagos Pendientes",
          href: `/tenant/${tenantId}/admin/cash-register/pending-payments`,
          active: pathname === `/tenant/${tenantId}/admin/cash-register/pending-payments`,
          badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
        },
      ],
    },
    {
      name: "Productos",
      href: `/tenant/${tenantId}/admin/products`,
      icon: Package,
      active: isActive("products"),
    },
    {
      name: "Categorías",
      href: `/tenant/${tenantId}/admin/categories`,
      icon: Tag,
      active: isActive("categories"),
    },
    {
      name: "Restaurante",
      href: `/tenant/${tenantId}/admin/restaurant`,
      icon: Store,
      active: isActive("restaurant"),
    },
    {
      name: "Usuarios",
      href: `/tenant/${tenantId}/admin/users`,
      icon: Users,
      active: isActive("users"),
    },
    {
      name: "Reportes",
      href: `/tenant/${tenantId}/admin/reports`,
      icon: BarChart3,
      active: isActive("reports"),
    },
    {
      name: "Configuración",
      href: `/tenant/${tenantId}/admin/settings/profile`,
      icon: Settings,
      active: isSettingsActive(),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="grid gap-4 py-4">
                  <div className="px-4">
                    <Link
                      href={`/tenant/${tenantId}/admin/dashboard`}
                      className="flex items-center gap-2 font-semibold"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  </div>
                  <div className="px-4">
                    <BranchSelector tenantId={tenantId} />
                  </div>
                  <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="grid gap-2 px-2">
                      {navigation.map((item) => (
                        <div key={item.name}>
                          {item.submenu ? (
                            <div className="grid gap-1">
                              <div
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                  item.active
                                    ? "bg-accent text-accent-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground",
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                                <ChevronDown className="ml-auto h-4 w-4" />
                              </div>
                              <div className="grid gap-1 pl-6">
                                {item.submenu.map((subitem) => (
                                  <Link
                                    key={subitem.name}
                                    href={subitem.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                      subitem.active
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground",
                                    )}
                                  >
                                    <span>{subitem.name}</span>
                                    {subitem.badge && (
                                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {subitem.badge}
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
                                item.active
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground",
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <Link href={`/tenant/${tenantId}/admin/dashboard`} className="flex items-center gap-2 font-semibold">
              <Home className="h-5 w-5" />
              <span className="hidden md:inline-block">Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <BranchSelector tenantId={tenantId} />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <ScrollArea className="py-6 pr-6">
            <nav className="grid gap-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div className="grid gap-1">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                          item.active
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </div>
                      <div className="grid gap-1 pl-6">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                              subitem.active
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                            <span>{subitem.name}</span>
                            {subitem.badge && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                {subitem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        item.active
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">{children}</main>
      </div>
    </div>
  )
}
