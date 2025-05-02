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
import { doc, getDoc, setDoc } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string, companyName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out")
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
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

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, getUserProfile }}>
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
