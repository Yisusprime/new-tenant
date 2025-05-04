"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUploaderExample } from "@/components/image-uploader-example"

export default function UploadExamplePage() {
  const { user, loading, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)

  // Obtener el tenantId del hostname
  useEffect(() => {
    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    if (hostname.includes(`.${rootDomain}`) && !hostname.startsWith("www.")) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      setTenantId(subdomain)
    }
  }, [])

  useEffect(() => {
    // Verificar si el usuario está autenticado y tiene acceso a este tenant
    if (
      !loading &&
      !isLogoutRef &&
      tenantId &&
      (!user || (user.tenantId !== tenantId && !checkUserRole("superadmin")))
    ) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para acceder a esta sección.",
        variant: "destructive",
      })
      router.push(`/login`)
    }
  }, [user, loading, tenantId, router, toast, checkUserRole, isLogoutRef])

  if (loading || !tenantId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <TenantAdminSidebar tenantid={tenantId} />
      <div className="flex-1 p-4 md:p-8 overflow-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Ejemplo de Subida de Imágenes</h1>
          <p className="text-muted-foreground">Prueba la funcionalidad de subida de imágenes a Firebase Storage</p>
        </div>

        <div className="max-w-2xl">
          <ImageUploaderExample />
        </div>
      </div>
    </div>
  )
}
