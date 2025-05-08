"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  type User,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface ProfileFormProps {
  user: User
  tenantId: string
  onUpdate: () => void
}

interface UserProfile {
  displayName: string
  phoneNumber: string
  address: string
  position: string
}

export function ProfileForm({ user, tenantId, onUpdate }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user.displayName || "",
    phoneNumber: "",
    address: "",
    position: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailForm, setEmailForm] = useState({ email: user.email || "", currentPassword: "" })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false)
  const [reauthAction, setReauthAction] = useState<"email" | "password" | null>(null)
  const { toast } = useToast()

  // Cargar datos adicionales del perfil desde Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db, `tenants/${tenantId}/users`, user.uid))

        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as Partial<UserProfile>
          setProfile((prev) => ({
            ...prev,
            ...profileData,
            displayName: user.displayName || profileData.displayName || "",
          }))
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [user, tenantId])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Actualizar displayName en Firebase Auth
      await updateProfile(user, {
        displayName: profile.displayName,
      })

      // Guardar datos adicionales en Firestore
      await setDoc(
        doc(db, `tenants/${tenantId}/users`, user.uid),
        {
          phoneNumber: profile.phoneNumber,
          address: profile.address,
          position: profile.position,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      )

      onUpdate()
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente",
      })
    } catch (error: any) {
      console.error("Error al actualizar el perfil:", error)
      setError(error.message || "Error al actualizar el perfil")
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReauthAction("email")
    setIsReauthDialogOpen(true)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setReauthAction("password")
    setIsReauthDialogOpen(true)
  }

  const handleReauthenticate = async () => {
    setLoading(true)
    setError(null)

    try {
      const password = reauthAction === "email" ? emailForm.currentPassword : passwordForm.currentPassword
      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)

      if (reauthAction === "email") {
        await updateEmail(user, emailForm.email)
        toast({
          title: "Email actualizado",
          description: "Tu dirección de email ha sido actualizada correctamente",
        })
      } else if (reauthAction === "password") {
        await updatePassword(user, passwordForm.newPassword)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada correctamente",
        })
      }

      setIsReauthDialogOpen(false)
      onUpdate()
    } catch (error: any) {
      console.error("Error:", error)
      setError(error.message || "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return <div className="text-center py-8">Cargando perfil...</div>
  }

  return (
    <>
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Información Personal</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Actualiza tu información de perfil</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre completo</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Teléfono</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" value={profile.address} onChange={handleProfileChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input id="position" name="position" value={profile.position} onChange={handleProfileChange} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Correo Electrónico</CardTitle>
                <CardDescription>Actualiza tu dirección de correo electrónico</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Nuevo correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={emailForm.email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading || emailForm.email === user.email}>
                    Actualizar Email
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading || !passwordForm.newPassword}>
                    Actualizar Contraseña
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de reautenticación */}
      <Dialog open={isReauthDialogOpen} onOpenChange={setIsReauthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar identidad</DialogTitle>
            <DialogDescription>
              Por razones de seguridad, debes ingresar tu contraseña actual para continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={reauthAction === "email" ? emailForm.currentPassword : passwordForm.currentPassword}
                onChange={(e) => {
                  if (reauthAction === "email") {
                    setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  } else {
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                }}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReauthDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleReauthenticate} disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
