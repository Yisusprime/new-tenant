"use client"

import type React from "react"

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
import { useAuth } from "@/lib/auth-context"

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshUserData } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

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

      // Verificar si el usuario es superadmin
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
      if (userData.role !== "superadmin") {
        toast({
          title: "Error",
          description: "No tienes permisos de Super Admin.",
          variant: "destructive",
        })
        await auth.signOut()
        setIsLoading(false)
        return
      }

      // Refrescar los datos del usuario en el contexto
      await refreshUserData()

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión como Super Admin.",
      })

      // Redireccionar al dashboard de superadmin
      router.push("/superadmin/dashboard")
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)

      // Mensajes de error más específicos
      let errorMessage = "Credenciales incorrectas o no tienes permisos de Super Admin."
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Super Admin - Iniciar sesión</CardTitle>
          <CardDescription>Accede al panel de administración principal</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gastroo.online"
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
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              Volver al inicio
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
