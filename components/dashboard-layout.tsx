"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings, LogOut, Menu, X, Users, Globe } from "lucide-react"
import { useState, useEffect } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, getUserProfile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      if (user) {
        try {
          const profile = await getUserProfile()
          setIsAdmin(profile?.role === "admin")
        } catch (error) {
          console.error("Error checking admin status:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, getUserProfile])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Configuración", href: "/settings", icon: Settings },
  ]

  const adminNavigation = [
    { name: "Tenants", href: "/admin/tenants", icon: Users },
    { name: "Dominios", href: "/admin/domains", icon: Globe },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      console.log("Usuario cerró sesión correctamente")
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
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

                {isAdmin && (
                  <>
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Administración</h3>
                    </div>
                    {adminNavigation.map((item) => (
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
                  </>
                )}

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

              {isAdmin && (
                <>
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Administración</h3>
                  </div>
                  {adminNavigation.map((item) => (
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
                </>
              )}
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
