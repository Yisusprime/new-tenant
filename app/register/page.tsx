"use client"

import type React from "react"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    restaurantName: "",
    tenantId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "restaurantName" && !formData.tenantId) {
      // Auto-generate tenant ID from restaurant name
      const tenantId = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20)

      setFormData({ ...formData, [name]: value, tenantId })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validar tenant ID
      if (!/^[a-z0-9]+$/.test(formData.tenantId)) {
        throw new Error("El ID del tenant solo puede contener letras minúsculas y números")
      }

      // Crear usuario
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const userId = userCredential.user.uid

      console.log("Usuario creado:", userId)

      // Guardar información del tenant en Firestore directamente
      await setDoc(doc(db, "tenants", formData.tenantId), {
        id: formData.tenantId,
        name: formData.restaurantName,
        createdAt: new Date().toISOString(),
        ownerId: userId,
        plan: "free",
      })

      // Guardar rol de administrador
      await setDoc(doc(db, `tenants/${formData.tenantId}/roles`, userId), {
        role: "admin",
        email: formData.email,
        createdAt: new Date().toISOString(),
      })

      console.log("Tenant creado en Firestore")

      // Mostrar mensaje de éxito
      setSuccess(`Restaurante "${formData.restaurantName}" registrado correctamente. Redirigiendo...`)

      // Redirigir al subdominio del tenant después de 2 segundos
      setTimeout(() => {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

        // Usar la URL completa para asegurarnos de que la redirección funcione correctamente
        window.location.href = `https://${formData.tenantId}.${rootDomain}/`
      }, 2000)
    } catch (err: any) {
      console.error("Error al registrar:", err)

      // Manejar errores específicos de Firebase
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está en uso")
      } else if (err.code === "auth/invalid-email") {
        setError("Correo electrónico inválido")
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña es demasiado débil")
      } else {
        setError(err.message || "Error al crear la cuenta")
      }

      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registra tu Restaurante</CardTitle>
          <CardDescription>Crea una cuenta para tu restaurante y obtén tu propio subdominio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-500 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="restaurantName">Nombre del Restaurante</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantId">ID del Subdominio</Label>
              <div className="flex items-center">
                <Input
                  id="tenantId"
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  required
                  pattern="[a-z0-9]+"
                  className="rounded-r-none"
                />
                <div className="bg-gray-100 px-3 py-2 border border-l-0 rounded-r-md text-gray-500">
                  .gastroo.online
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Solo letras minúsculas y números, sin espacios ni caracteres especiales
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Restaurante"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Al registrarte, aceptas nuestros{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
