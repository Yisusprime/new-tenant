"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { auth, db } from "./firebase"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

// Definir los tipos de roles disponibles
export type UserRole = "admin" | "client" | "delivery" | "waiter" | "manager" | "user"

interface AuthContextType {
  user: User | null
  loading: boolean
  userProfile: any | null
  signUp: (email: string, password: string, name: string, companyName: string) => Promise<void>
  signUpTenantUser: (email: string, password: string, name: string, role: UserRole, tenantId: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")
      setUser(user)

      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  const signUp = async (email: string, password: string, name: string, companyName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Generate a unique subdomain from company name
      const subdomain = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20)

      // Determinar si es el primer usuario (admin)
      const usersCollection = await getDoc(doc(db, "system", "stats"))
      const isFirstUser = !usersCollection.exists() || !usersCollection.data()?.userCount

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        companyName,
        subdomain,
        role: isFirstUser ? "admin" : "user", // Asignar rol de admin al primer usuario
        isTenantOwner: true, // Este usuario es dueño de un tenant
        tenantId: subdomain, // El tenant al que pertenece
        createdAt: new Date().toISOString(),
      })

      // Create tenant record
      await setDoc(doc(db, "tenants", subdomain), {
        ownerId: user.uid,
        name: companyName,
        subdomain,
        customDomain: null,
        active: true,
        createdAt: new Date().toISOString(),
      })

      // Actualizar estadísticas del sistema
      await setDoc(
        doc(db, "system", "stats"),
        {
          userCount: (usersCollection.data()?.userCount || 0) + 1,
          lastRegistration: new Date().toISOString(),
        },
        { merge: true },
      )

      // Redirigir al subdominio del tenant
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      window.location.href = `https://${subdomain}.${rootDomain}/dashboard`
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  // Nuevo método para registrar usuarios dentro de un tenant
  const signUpTenantUser = async (email: string, password: string, name: string, role: UserRole, tenantId: string) => {
    try {
      // Verificar que el tenant exista
      const tenantDoc = await getDoc(doc(db, "tenants", tenantId))
      if (!tenantDoc.exists()) {
        throw new Error(`El tenant ${tenantId} no existe`)
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        role, // Rol específico asignado
        isTenantOwner: false, // Este usuario no es dueño del tenant
        tenantId, // El tenant al que pertenece
        createdAt: new Date().toISOString(),
      })

      // Actualizar contador de usuarios en el tenant
      await updateDoc(doc(db, "tenants", tenantId), {
        userCount: (tenantDoc.data()?.userCount || 0) + 1,
        lastUserAdded: new Date().toISOString(),
      })

      // No redirigimos aquí, dejamos que la página de registro maneje la redirección
    } catch (error) {
      console.error("Error signing up tenant user:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // La redirección se manejará en el componente de login
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...")
      await firebaseSignOut(auth)
      console.log("Sign out successful")
      // Limpiar cualquier estado local si es necesario
      return Promise.resolve()
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!user) return null

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (error) {
      console.error("Error getting user profile:", error)
      throw error
    }
  }

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userProfile,
        signUp,
        signUpTenantUser,
        signIn,
        signOut,
        getUserProfile,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
