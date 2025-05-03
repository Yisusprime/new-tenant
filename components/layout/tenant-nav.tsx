"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/context/auth-context"
import { useTenant } from "@/lib/context/tenant-context"
import { signOut } from "@/lib/services/auth-service"

interface TenantNavProps {
  items?: {
    title: string
    href: string
    disabled?: boolean
  }[]
}

export function TenantNav({ items }: TenantNavProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { tenant } = useTenant()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">{tenant?.name || "Tenant"}</span>
      </Link>
      {items?.length ? (
        <nav className="flex gap-6">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-sm font-medium text-muted-foreground",
                item.href.startsWith(pathname) && "text-foreground",
                item.disabled && "cursor-not-allowed opacity-80",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className="flex-1 flex justify-end">
        {user ? (
          <Button variant="ghost" onClick={() => signOut()}>
            Cerrar sesión
          </Button>
        ) : (
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
