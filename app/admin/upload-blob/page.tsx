"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TenantAdminSidebar } from "@/components/tenant-admin-sidebar"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { BlobImageUploader } from "@/components/blob-image-uploader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BlobUploadPage() {
  const { user, loading, checkUserRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isLogoutRef, setIsLogoutRef] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState("")

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
          <h1 className="text-2xl md:text-3xl font-bold">Subida de Imágenes con Vercel Blob</h1>
          <p className="text-muted-foreground">
            Prueba la funcionalidad de subida de imágenes usando Vercel Blob Storage
          </p>
        </div>

        <Tabs defaultValue="standard">
          <TabsList className="mb-4">
            <TabsTrigger value="standard">Estándar</TabsTrigger>
            <TabsTrigger value="square">Cuadrado</TabsTrigger>
            <TabsTrigger value="wide">Panorámico</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Subir Imagen (Estándar)</CardTitle>
                <CardDescription>Sube una imagen con relación de aspecto estándar</CardDescription>
              </CardHeader>
              <CardContent>
                <BlobImageUploader
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  folder={`${tenantId}/test-uploads`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="square">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Subir Imagen (Cuadrada)</CardTitle>
                <CardDescription>Sube una imagen con relación de aspecto 1:1</CardDescription>
              </CardHeader>
              <CardContent>
                <BlobImageUploader
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  folder={`${tenantId}/test-uploads`}
                  aspectRatio="square"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wide">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Subir Imagen (Panorámica)</CardTitle>
                <CardDescription>Sube una imagen con relación de aspecto 21:9</CardDescription>
              </CardHeader>
              <CardContent>
                <BlobImageUploader
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  folder={`${tenantId}/test-uploads`}
                  aspectRatio="wide"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Subir Imagen (Personalizada)</CardTitle>
                <CardDescription>Sube una imagen con relación de aspecto 4:3</CardDescription>
              </CardHeader>
              <CardContent>
                <BlobImageUploader
                  onImageUploaded={(url) => setUploadedImageUrl(url)}
                  folder={`${tenantId}/test-uploads`}
                  aspectRatio={4 / 3}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {uploadedImageUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Imagen Subida</h2>
            <p className="text-sm text-muted-foreground mb-4">
              La imagen se ha subido correctamente a Vercel Blob Storage.
            </p>
            <div className="bg-muted p-4 rounded-md">
              <code className="text-sm break-all">{uploadedImageUrl}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
