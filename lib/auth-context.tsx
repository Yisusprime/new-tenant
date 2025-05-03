"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase/client"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
  checkTenantAccess: (tenantId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Configurar persistencia local para mantener la sesión
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Persistencia configurada correctamente")
      })
      .catch((error) => {
        console.error("Error al configurar persistencia:", error)
      })

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No autenticado")
      setUser(user)

      if (user) {
        try {
          const profile = await getUserProfile()
          console.log("Perfil de usuario cargado:", profile)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error al cargar perfil:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      console.log("Iniciando sesión con:", email)
      await signInWithEmailAndPassword(auth, email, password)
      console.log("Sesión iniciada correctamente")

      // No redirigir automáticamente, dejar que el componente que llama maneje la redirección
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setError(null)
      console.log("Registrando usuario con:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("Usuario registrado correctamente:", user.uid)

      // Determinar el rol basado en la ruta y los datos proporcionados
      let role = userData.role || "user" // Valor por defecto

      // Si no se especificó un rol, determinarlo por la ruta
      if (!userData.role) {
        if (pathname?.startsWith("/superadmin")) {
          role = "superadmin"
        } else if (pathname?.startsWith("/tenant/")) {
          role = "client"
        } else {
          role = "admin" // Registro desde la página principal
        }
      }

      console.log("Rol asignado:", role)

      // Crear perfil de usuario
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        email,
        createdAt: serverTimestamp(),
        role,
      })
      console.log("Perfil de usuario creado")

      // Si es el primer usuario, asignarle rol de superadmin
      if (role !== "superadmin") {
        const statsDoc = await getDoc(doc(db, "system", "stats"))
        if (!statsDoc.exists()) {
          console.log("Primer usuario, asignando rol de superadmin")
          // Es el primer usuario, asignarle rol de superadmin
          await setDoc(doc(db, "users", user.uid), {
            ...userData,
            email,
            createdAt: serverTimestamp(),
            role: "superadmin",
          })

          // Crear documento de estadísticas
          await setDoc(doc(db, "system", "stats"), {
            totalUsers: 1,
            totalSuperadmins: 1,
            totalTenants: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          console.log("Estadísticas iniciales creadas")
        } else {
          // Actualizar estadísticas
          await setDoc(
            doc(db, "system", "stats"),
            {
              totalUsers: (statsDoc.data()?.totalUsers || 0) + 1,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
          console.log("Estadísticas actualizadas")
        }
      }

      // Si se proporcionó un subdominio, crear tenant
      if (userData.subdomain) {
        console.log("Creando tenant con subdominio:", userData.subdomain)
        await setDoc(doc(db, "tenants", userData.subdomain), {
          name: userData.companyName || userData.subdomain,
          subdomain: userData.subdomain,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          status: "active",
        })
        console.log("Tenant creado correctamente")

        // Actualizar el perfil del usuario con el subdominio
        await setDoc(
          doc(db, "users", user.uid),
          {
            subdomain: userData.subdomain,
          },
          { merge: true },
        )
        console.log("Perfil de usuario actualizado con subdominio")

        // Actualizar estadísticas
        const statsDoc = await getDoc(doc(db, "system", "stats"))
        if (statsDoc.exists()) {
          await setDoc(
            doc(db, "system", "stats"),
            {
              ...statsDoc.data(),
              totalTenants: (statsDoc.data()?.totalTenants || 0) + 1,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
          console.log("Estadísticas de tenants actualizadas")
        }
      }

      return userCredential
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      setError(error.message || "Error al registrarse")
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("Cerrando sesión")
      await firebaseSignOut(auth)
      console.log("Sesión cerrada correctamente")
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error)
      setError(error.message || "Error al cerrar sesión")
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!user) return null

    try {
      console.log("Obteniendo perfil del usuario:", user.uid)
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        console.log("Perfil encontrado:", docSnap.data())
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        console.error("No se encontró el perfil del usuario")
        return null
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      throw error
    }
  }

  const checkTenantAccess = async (tenantId: string) => {
    if (!user) return false

    try {
      // Obtener perfil del usuario
      const profile = await getUserProfile()

      if (!profile) return false

      // Si es superadmin, tiene acceso a todos los tenants
      if (profile.role === "superadmin") return true

      // Si es admin, verificar si es propietario del tenant
      if (profile.role === "admin") {
        const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
        if (tenantDoc.exists() && tenantDoc.data().ownerId === user.uid) {
          return true
        }
      }

      // Si es cliente, verificar si está asociado al tenant
      if (profile.role === "client" && profile.tenantId === tenantId) {
        return true
      }

      return false
    } catch (error) {
      console.error("Error al verificar acceso al tenant:", error)
      return false
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    getUserProfile,
    checkTenantAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
