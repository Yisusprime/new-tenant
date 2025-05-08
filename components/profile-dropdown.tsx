"use client"

import { useAuth } from "@/lib/context/auth-context"
import { useProfile } from "@/lib/context/profile-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"

export function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const { profile, isLoading } = useProfile()

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-2">
          <Avatar className="h-8 w-8 mr-2">
            {profile?.photoURL ? (
              <AvatarImage
                src={profile.photoURL || "/placeholder.svg"}
                alt={profile?.displayName || user?.email || "Usuario"}
              />
            ) : (
              <AvatarFallback>{(profile?.displayName || user?.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {isLoading ? "Cargando..." : profile?.displayName || user?.email?.split("@")[0] || "Usuario"}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
