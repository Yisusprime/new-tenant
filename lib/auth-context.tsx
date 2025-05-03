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

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile)
      } else {
        console.warn("Perfil de usuario no encontrado en Firestore")
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error al cargar perfil de usuario:", error)
      setUserProfile(null)
    }
  }

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Función para iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      throw error
    }
  }

  // Función para registrarse
  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error("Error al registrarse:", error)
      throw error
    }
  }

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUserProfile(null)

      // La eliminación de cookies se maneja en la acción del servidor
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
