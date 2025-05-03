"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface TenantPublicNavbarProps {
  tenantId: string
  tenantName: string
  logoUrl?: string
}

export default function TenantPublicNavbar({ tenantId, tenantName, logoUrl }: TenantPublicNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b w-full bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl || "/placeholder.svg"} alt={`${tenantName} logo`} className="h-8 w-8 object-contain" />
          )}
          <Link href={`/tenant/${tenantId}`} className="font-bold text-xl">
            {tenantName}
          </Link>
        </div>

        {/* Menú para pantallas medianas y grandes */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/tenant/${tenantId}`} className="text-sm font-medium hover:text-primary hover:underline">
            Inicio
          </Link>
          <Link href={`/tenant/${tenantId}/menu`} className="text-sm font-medium hover:text-primary hover:underline">
            Menú
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href={`/tenant/${tenantId}/login`}>
            <Button variant="ghost" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href={`/tenant/${tenantId}/register`}>
            <Button size="sm">Registrarse</Button>
          </Link>

          {/* Botón de menú móvil */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto py-4 px-4 flex flex-col gap-4">
            <Link
              href={`/tenant/${tenantId}`}
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href={`/tenant/${tenantId}/menu`}
              className="text-sm font-medium hover:text-primary py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Menú
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
