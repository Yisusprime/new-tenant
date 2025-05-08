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
    console.log("Setting up auth state listener")
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user")
      setUser(user)
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log("Signing out user")
    await firebaseSignOut(auth)
  }

  return <AuthContext.Provider value={{ user, loading, signOut, tenantId }}>{children}</AuthContext.Provider>
}
