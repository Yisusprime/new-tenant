"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  tenantId: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  tenantId: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({
  children,
  tenantId = null,
}: {
  children: React.ReactNode
  tenantId?: string | null
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("AuthProvider initialized with tenantId:", tenantId)

    // Verificar si ya hay un usuario autenticado
    const currentUser = auth.currentUser
    if (currentUser) {
      console.log("User already authenticated:", currentUser.email)
      setUser(currentUser)
      setLoading(false)
    }

    // Establecer un timeout para el estado de carga
    const authStateTimeout = setTimeout(() => {
      if (loading) {
        console.log("Auth state timeout reached, forcing loading to complete")
        setLoading(false)
      }
    }, 3000) // 3 segundos de timeout

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User authenticated: ${user.email}` : "No user")
      setUser(user)
      setLoading(false)
      clearTimeout(authStateTimeout)
    })

    return () => {
      console.log("AuthProvider cleanup")
      unsubscribe()
      clearTimeout(authStateTimeout)
    }
  }, [tenantId])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      console.log("User signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const contextValue = {
    user,
    loading,
    signOut,
    tenantId,
  }

  console.log("AuthProvider rendering with:", {
    user: user ? `${user.email} (${user.uid})` : "null",
    loading,
    tenantId,
  })

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
