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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  checkUserRole: () => false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              role: userData.role,
              tenantId: userData.tenantId,
            })
          } else {
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
    if (!user) return false
    return user.role === requiredRole
  }

  return <AuthContext.Provider value={{ user, loading, logout, checkUserRole }}>{children}</AuthContext.Provider>
}
