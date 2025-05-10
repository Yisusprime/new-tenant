"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { MobileNavigation } from "../components/mobile-navigation"

export default function MenuLoginPage({
  params,
}: {
  params: { tenantId: string }
}) {
  const { tenantId } = params
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is already logged in
  useEffect(() => {
    console.log("Login page: Checking auth state")

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Login page: Forcing loading state to complete after timeout")
      setInitialLoading(false)
    }, 3000)

    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Login page: Auth state changed", user ? "User logged in" : "No user")

      if (user) {
        // User is signed in, redirect to profile
        router.push(`/tenant/${tenantId}/menu/profile`)
      } else {
        // No user is signed in, show login form
        setInitialLoading(false)
      }

      clearTimeout(timeoutId)
    })

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [tenantId, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("Login page: Attempting to sign in with email and password")
      await signInWithEmailAndPassword(auth, email, password)
      console.log("Login page: Sign in successful")
      router.push(`/tenant/${tenantId}/menu/profile`)
    } catch (error: any) {
      console.error("Login page: Error signing in:", error)

      let errorMessage = "No se pudo iniciar sesión. Verifica tus credenciales."
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Email o contraseña incorrectos"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
      }

      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("Login page: Attempting to create user with email and password")
      await createUserWithEmailAndPassword(auth, email, password)
      console.log("Login page: User creation successful")
      toast({
        title: "Cuenta creada",
        description: "Tu cuenta ha sido creada exitosamente",
      })
      router.push(`/tenant/${tenantId}/menu/profile`)
    } catch (error: any) {
      console.error("Login page: Error registering:", error)

      let errorMessage = "No se pudo crear la cuenta"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está en uso"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      }

      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500">Cargando...</p>
          </div>
        </div>
        <div className="md:hidden">
          <MobileNavigation />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8 pb-24 md:pb-8 pt-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push(`/tenant/${tenantId}/menu`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Mi Cuenta</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa a tu cuenta para ver tus pedidos y más</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Contraseña</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" form="login-form" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Iniciar Sesión
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>Regístrate para realizar pedidos y más</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="register-form" onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" form="register-form" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Crear Cuenta
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
