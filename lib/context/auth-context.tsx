"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  tenantId: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("AuthProvider initialized with tenantId:", tenantId)

    let unsubscribed = false
    let timeoutId: NodeJS.Timeout

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (!unsubscribed && loading) {
        console.warn("Auth state change timed out after 10 seconds")
        setLoading(false)
        setError("Tiempo de espera agotado al cargar la información del usuario")
      }
    }, 10000)

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (unsubscribed) return

        console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user")
        setUser(user)
        setLoading(false)
        setError(null)
        clearTimeout(timeoutId)
      },
      (error) => {
        if (unsubscribed) return

        console.error("Auth state change error:", error)
        setLoading(false)
        setError(error.message)
        clearTimeout(timeoutId)
      },
    )

    // Check if we already have a user in localStorage as a fallback
    if (typeof window !== "undefined") {
      const cachedUser = localStorage.getItem("authUser")
      if (cachedUser) {
        try {
          console.log("Using cached user from localStorage")
          // This is just a basic cache, not a full auth solution
          // It will be overwritten by the actual auth state when it resolves
          const parsedUser = JSON.parse(cachedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error("Error parsing cached user:", e)
        }
      }
    }

    return () => {
      unsubscribed = true
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [tenantId])

  // Cache the user in localStorage when it changes
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      try {
        // Only store minimal user info, not the full user object
        const minimalUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }
        localStorage.setItem("authUser", JSON.stringify(minimalUser))
      } catch (e) {
        console.error("Error caching user:", e)
      }
    }
  }, [user])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser")
      }
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Error al cerrar sesión")
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, signOut, tenantId }}>{children}</AuthContext.Provider>
}
