"use client"

import { useEffect, useState } from "react"
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
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export function ProfileDropdown() {
  const { user, signOut, tenantId } = useAuth()
  const { profile, isLoading } = useProfile()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserInfo() {
      if (!user || !tenantId) return

      try {
        // Obtener información del rol
        const roleDoc = await getDoc(doc(db, `tenants/${tenantId}/roles`, user.uid))
        if (roleDoc.exists()) {
          const roleData = roleDoc.data()
          setUserRole(roleData.role || "Usuario")
          setUserEmail(roleData.email || user.email)

          // Si no hay un nombre en el perfil, usar el email como nombre por defecto
          if (roleData.email) {
            const emailName = roleData.email.split("@")[0]
            setDisplayName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
          }
        }
      } catch (error) {
        console.error("Error al cargar información del usuario:", error)
      }
    }

    loadUserInfo()
  }, [user, tenantId])

  // Actualizar el nombre cuando se cargue el perfil
  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName)
    }
  }, [profile])

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const getInitial = () => {
    if (profile?.displayName) return profile.displayName.charAt(0).toUpperCase()
    if (displayName) return displayName.charAt(0).toUpperCase()
    if (userEmail) return userEmail.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return "U"
  }

  const getName = () => {
    if (isLoading) return "Cargando..."
    if (profile?.displayName) return profile.displayName
    if (displayName) return displayName
    if (userEmail) return userEmail.split("@")[0]
    if (user?.email) return user.email.split("@")[0]
    return "Usuario"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start px-2">
          <Avatar className="h-8 w-8 mr-2">
            {profile?.photoURL ? (
              <AvatarImage src={profile.photoURL || "/placeholder.svg"} alt={getName()} />
            ) : (
              <AvatarFallback>{getInitial()}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{getName()}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {userEmail || user?.email || ""}
            </span>
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
