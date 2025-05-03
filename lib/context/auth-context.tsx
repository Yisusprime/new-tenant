"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User as FirebaseUser, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { getUserById } from "../services/auth-service"
import type { User } from "../models/tenant"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        const userData = await getUserById(firebaseUser.uid)
        setUser(userData)
      } else {
        setUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, firebaseUser, loading }}>{children}</AuthContext.Provider>
}
