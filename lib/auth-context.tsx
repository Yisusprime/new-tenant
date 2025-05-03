"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase/client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          const profile = await getUserProfile()
          setUserProfile(profile)
        } catch (error) {
          console.error("Error al cargar perfil:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Crear perfil de usuario
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        email,
        createdAt: serverTimestamp(),
        role: "user", // Rol por defecto
      })

      // Si es el primer usuario, asignarle rol de superadmin
      const statsDoc = await getDoc(doc(db, "system", "stats"))
      if (!statsDoc.exists()) {
        // Es el primer usuario, asignarle rol de superadmin
        await setDoc(doc(db, "users", user.uid), {
          ...userData,
          email,
          createdAt: serverTimestamp(),
          role: "superadmin",
        })

        // Crear documento de estadísticas
        await setDoc(doc(db, "system", "stats"), {
          totalUsers: 1,
          totalTenants: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      // Si se proporcionó un subdominio, crear tenant
      if (userData.subdomain) {
        await setDoc(doc(db, "tenants", userData.subdomain), {
          name: userData.companyName || userData.subdomain,
          subdomain: userData.subdomain,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          status: "active",
        })

        // Actualizar estadísticas
        if (statsDoc.exists()) {
          await setDoc(
            doc(db, "system", "stats"),
            {
              ...statsDoc.data(),
              totalTenants: (statsDoc.data()?.totalTenants || 0) + 1,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          )
        }
      }
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      setError(error.message || "Error al registrarse")
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error)
      setError(error.message || "Error al cerrar sesión")
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!user) return null

    try {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        console.error("No se encontró el perfil del usuario")
        return null
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    getUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
