"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesktopNavigation } from "../components/desktop-navigation"
import { MobileNavigation } from "../components/mobile-navigation"

export default function ClientLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string>("")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Obtener el tenantId del hostname
    const hostname = window.location.hostname
    const subdomain = hostname.split(".")[0]
    setTenantId(subdomain)

    // Verificar si ya hay un usuario autenticado
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Redirigir al perfil si ya está autenticado
        router.push(`/menu/profile`)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData({ ...loginData, [name]: value })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData({ ...registerData, [name]: value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
      router.push(`/menu/profile`)
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err)

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Credenciales inválidas")
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos fallidos. Intenta más tarde")
      } else {
        setError("Error al iniciar sesión")
      }

      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, registerData.email, registerData.password)
      router.push(`/menu/profile`)
    } catch (err: any) {
      console.error("Error al registrarse:", err)

      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado")
      } else if (err.code === "auth/invalid-email") {
        setError("Correo electrónico inválido")
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil")
      } else {
        setError("Error al crear la cuenta")
      }

      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <DesktopNavigation />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Contraseña</Label>
                      <a href="#" className="text-xs text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-500">
                Al continuar, aceptas nuestros{" "}
                <a href="#" className="text-primary hover:underline">
                  Términos de servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de privacidad
                </a>
              </p>
            </CardFooter>
          </Tabs>
        </Card>
      </div>

      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  )
}
