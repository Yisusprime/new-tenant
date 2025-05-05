"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart/cart-button"
import { StoreStatusBadge } from "@/components/store-status-badge"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Link href="/" className="font-bold text-xl">
          Gastroo
        </Link>
        <StoreStatusBadge tenantId={user?.tenantId || ""} />
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/menu">
          <Button variant="ghost">Menú</Button>
        </Link>
        <CartButton />
      </div>
    </nav>
  )
}
