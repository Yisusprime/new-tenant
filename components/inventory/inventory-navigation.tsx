"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function InventoryNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
      <Link
        href="/admin/inventory"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/inventory/ingredients"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory/ingredients") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Ingredientes
      </Link>
      <Link
        href="/admin/inventory/suppliers"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory/suppliers") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Proveedores
      </Link>
      <Link
        href="/admin/inventory/purchases"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory/purchases") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Compras
      </Link>
      <Link
        href="/admin/inventory/recipes"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory/recipes") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Recetas
      </Link>
      <Link
        href="/admin/inventory/movements"
        className={`px-4 py-2 rounded-md ${isActive("/admin/inventory/movements") ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
      >
        Movimientos
      </Link>
    </div>
  )
}
