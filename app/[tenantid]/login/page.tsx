"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"
import { useToast } from "@/components/ui/use-toast"
import { getTenantInfo } from "@/lib/tenant-utils"

export default function TenantLoginPage({ params }: { params: { tenantid: string } }) {
  const { tenantid } = params
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tenantInfo, setTenantInfo] = useState<any>(null)
  const [tenantLoading, setTenantLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Cargar información del tenant
  React.useEffect(() => {
    async function loadTenantInfo() {
      try {
        const info = await getTenantInfo(tenantid)
        setTenantInfo(info)
      } catch (error) {
        console.error("Error al cargar información del tenant:", error)
      } finally {
        setTenantLoading(false)
      }
    }

    loadTenantInfo()
  }, [tenantid])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Obtener información del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        toast({
          title: "Error",
          description: "Usuario no encontrado en la base de datos.",
          variant: "destructive",
        })
        await auth.signOut()
        setIsLoading(false)
        return
      }

      const userData = userDoc.data()

      // Verificar si el usuario pertenece a este tenant o es superadmin
      if (userData.tenantId !== tenantid && userData.role !== "superadmin") {
        toast({
          title: "Error",
          description: "No tienes acceso a este tenant.",
          variant: "destructive",
        })
        await auth.signOut()
        setIsLoading(false)
        return
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente.",
      })

      // Redireccionar al dashboard del tenant
      router.push(`/${tenantid}/admin/dashboard`)
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)

      // Mensajes de error más específicos
      let errorMessage = "Credenciales incorrectas."
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Email o contraseña incorrectos."
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este email."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (tenantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!tenantInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tenant no encontrado</CardTitle>
            <CardDescription className="text-center">
              El tenant "{tenantid}" no existe o no está disponible
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar sesión en {tenantInfo.name}</CardTitle>
          <CardDescription>Accede a tu cuenta en {tenantid}.gastroo.online</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href={`/${tenantid}/register`} className="text-primary underline-offset-4 hover:underline">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
