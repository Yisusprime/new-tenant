"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { auth, db } from "./firebase/client"
import { doc, getDoc } from "firebase/firestore"

// Definir el tipo para el perfil de usuario
interface UserProfile {
  name: string
  email: string
  role: "superadmin" | "admin" | "client"
  tenantId?: string
  [key: string]: any
}

// Definir el tipo para el contexto
type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string) => Promise<User>
  signOut: () => Promise<void>
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | null>(null)

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (uid: string) => {
    try {
      console.log("Cargando perfil para UID:", uid)
      const userDoc = await getDoc(doc(db, "users", uid))

      if (userDoc.exists()) {
        console.log("Perfil encontrado:", userDoc.data())
        setUserProfile(userDoc.data() as UserProfile)
      } else {
        console.warn("Perfil de usuario no encontrado en Firestore para UID:", uid)
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error al cargar perfil de usuario:", error)
      setUserProfile(null)
      setError("Error al cargar perfil de usuario")
    }
  }

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    console.log("Configurando listener de autenticación")

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Estado de autenticación cambiado:", user?.email)
        setUser(user)

        if (user) {
          await loadUserProfile(user.uid)
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      },
      (error) => {
        console.error("Error en onAuthStateChanged:", error)
        setError(error.message)
        setLoading(false)
      },
    )

    return () => {
      console.log("Limpiando listener de autenticación")
      unsubscribe()
    }
  }, [])

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      console.log("Intentando iniciar sesión con:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Inicio de sesión exitoso:", userCredential.user.email)
      return userCredential.user
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    }
  }

  // Función para registrarse
  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      console.log("Intentando registrar usuario:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Registro exitoso:", userCredential.user.email)
      return userCredential.user
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      setError(error.message || "Error al registrarse")
      throw error
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      setError(null)
      console.log("Cerrando sesión")
      await firebaseSignOut(auth)
      setUserProfile(null)
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error)
      setError(error.message || "Error al cerrar sesión")
      throw error
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
