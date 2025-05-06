"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"

type User = {
  uid: string
  email: string | null
  name?: string
  role?: "admin" | "superadmin" | "user"
  tenantId?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  checkUserRole: (requiredRole: string) => boolean
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  checkUserRole: () => false,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Función para cargar los datos del usuario desde Firestore
  const loadUserData = async (firebaseUser: any) => {
    try {
      console.log("Loading user data for:", firebaseUser.uid)
      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        console.log("User data loaded:", userData)
        console.log("User tenantId:", userData.tenantId)

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: userData.name,
          role: userData.role,
          tenantId: userData.tenantId,
        })
      } else {
        console.log("User document does not exist")
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        })
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      })
    }
  }

  // Función para refrescar los datos del usuario
  const refreshUserData = async () => {
    const currentUser = auth.currentUser
    if (currentUser) {
      await loadUserData(currentUser)
    }
  }

  useEffect(() => {
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? "User logged in" : "No user")
      if (firebaseUser) {
        await loadUserData(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const checkUserRole = (requiredRole: string) => {
    console.log("Checking user role:", user?.role, "Required role:", requiredRole)
    if (!user) return false
    return user.role === requiredRole
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkUserRole, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}
