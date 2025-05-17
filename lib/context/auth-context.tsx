"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { useRouter } from "next/navigation"
import { parseCookies, setCookie, destroyCookie } from "nookies"

// Add these constants at the top of the file
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const SESSION_COOKIE_NAME = "session_expiry"

// Update the AuthContextType interface to include the new functions
interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  tenantId: string | null
  resetSessionTimeout: () => void
}

// Update the default context value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  tenantId: null,
  resetSessionTimeout: () => {},
})

export const useAuth = () => useContext(AuthContext)

// Update the AuthProvider component
export const AuthProvider = ({
  children,
  tenantId = null,
}: {
  children: React.ReactNode
  tenantId?: string | null
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Function to handle session timeout
  const handleSessionTimeout = useCallback(() => {
    console.log("Session expired, logging out user")
    signOut()
    router.push("/login")
  }, [router])

  // Function to reset session timeout
  const resetSessionTimeout = useCallback(() => {
    if (typeof window !== "undefined") {
      const expiryTime = new Date(Date.now() + SESSION_TIMEOUT).toISOString()
      setCookie(null, SESSION_COOKIE_NAME, expiryTime, {
        maxAge: SESSION_TIMEOUT / 1000,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      console.log("Session timeout reset, new expiry:", expiryTime)
    }
  }, [])

  // Check for session expiry
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const checkSessionExpiry = () => {
        const cookies = parseCookies()
        const expiryTime = cookies[SESSION_COOKIE_NAME]

        if (!expiryTime) {
          resetSessionTimeout()
          return
        }

        const now = new Date()
        const expiry = new Date(expiryTime)

        if (now > expiry) {
          handleSessionTimeout()
        }
      }

      // Check session expiry every minute
      const interval = setInterval(checkSessionExpiry, 60 * 1000)

      // Initial check
      checkSessionExpiry()

      return () => clearInterval(interval)
    }
  }, [user, handleSessionTimeout, resetSessionTimeout])

  // Track user activity to reset session timeout
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"]

      const handleUserActivity = () => {
        resetSessionTimeout()
      }

      // Add event listeners for user activity
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity)
      })

      return () => {
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity)
        })
      }
    }
  }, [user, resetSessionTimeout])

  useEffect(() => {
    // Añadir más logs para depuración
    console.log("AuthProvider initialized with tenantId:", tenantId)

    // Verificar si ya hay un usuario autenticado
    const currentUser = auth.currentUser
    if (currentUser) {
      console.log("User already authenticated:", currentUser.email)
      setUser(currentUser)
      setLoading(false)
      resetSessionTimeout()
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User authenticated: ${user.email}` : "No user")
      setUser(user)
      setLoading(false)

      if (user) {
        resetSessionTimeout()
      } else {
        // Clear session cookie when user logs out
        if (typeof window !== "undefined") {
          destroyCookie(null, SESSION_COOKIE_NAME, { path: "/" })
        }
      }
    })

    return () => {
      console.log("AuthProvider cleanup")
      unsubscribe()
    }
  }, [tenantId, resetSessionTimeout])

  const signOut = async () => {
    try {
      if (typeof window !== "undefined") {
        destroyCookie(null, SESSION_COOKIE_NAME, { path: "/" })
      }
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
    resetSessionTimeout,
  }

  console.log("AuthProvider rendering with:", {
    user: user ? `${user.email} (${user.uid})` : "null",
    loading,
    tenantId,
  })

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
