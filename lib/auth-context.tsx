"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  type UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "./firebase/client"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

interface AuthContextType {
  user: User | null
  userProfile: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<UserCredential>
  signUp: (email: string, password: string, userData: any) => Promise<UserCredential>
  signOut: () => Promise<void>
  getUserProfile: () => Promise<any>
  updateUserProfile: (data: any) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isBrowser || !auth) {
      setLoading(false)
      return
    }

    // Configurar persistencia local para mantener la sesión
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Persistencia configurada correctamente")
      })
      .catch((error) => {
        console.error("Error al configurar persistencia:", error)
      })

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No autenticado")
      setUser(user)

      if (user) {
        try {
          const profile = await getUserProfile()
          console.log("Perfil de usuario cargado:", profile)

          if (!profile) {
            console.warn("Perfil no encontrado, creando perfil básico")
            // Crear un perfil básico si no existe
            const basicProfile = {
              email: user.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              role: "user", // Rol por defecto
            }

            await setDoc(doc(db, "users", user.uid), basicProfile)
            setUserProfile(basicProfile)
          } else {
            setUserProfile(profile)
          }
        } catch (error) {
          console.error("Error al cargar perfil:", error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isBrowser || !auth) {
      throw new Error("La autenticación no está disponible en el servidor")
    }

    try {
      setError(null)
      console.log("Iniciando sesión con:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("Sesión iniciada correctamente")

      // Devolver el userCredential para que pueda ser usado por el componente
      return userCredential
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error)
      setError(error.message || "Error al iniciar sesión")
      throw error
    }
  }

  // Actualizar la función signUp para asegurar la correcta creación del tenant

  const signUp = async (email: string, password: string, userData: any) => {
    if (!isBrowser || !auth || !db) {
      throw new Error("La autenticación no está disponible en el servidor")
    }

    try {
      setError(null)
      console.log("Registrando usuario con:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("Usuario registrado correctamente:", user.uid)

      // Usar el rol proporcionado en userData o "user" como valor por defecto
      const role = userData.role || "user" // Valor por defecto

      // Crear perfil de usuario
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role,
      })
      console.log("Perfil de usuario creado con rol:", role)

      // Si se proporcionó un subdominio, crear tenant
      if (userData.subdomain) {
        console.log("Creando tenant con subdominio:", userData.subdomain)

        // Verificar si el tenant ya existe
        const tenantRef = doc(db, "tenants", userData.subdomain)
        const tenantDoc = await getDoc(tenantRef)

        if (tenantDoc.exists()) {
          throw new Error(`El subdominio ${userData.subdomain} ya está en uso. Por favor, elige otro.`)
        }

        // Crear el tenant
        await setDoc(tenantRef, {
          name: userData.companyName || userData.subdomain,
          subdomain: userData.subdomain,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: "active",
        })
        console.log("Tenant creado correctamente")

        // Actualizar el perfil del usuario con el subdominio
        await setDoc(
          doc(db, "users", user.uid),
          {
            subdomain: userData.subdomain,
            tenantId: userData.subdomain,
          },
          { merge: true },
        )
        console.log("Perfil de usuario actualizado con subdominio")
      }

      return userCredential
    } catch (error: any) {
      console.error("Error al registrarse:", error)
      setError(error.message || "Error al registrarse")
      throw error
    }
  }

  const signOut = async () => {
    if (!isBrowser || !auth) {
      throw new Error("La autenticación no está disponible en el servidor")
    }

    try {
      console.log("Cerrando sesión")
      await firebaseSignOut(auth)
      console.log("Sesión cerrada correctamente")
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error)
      setError(error.message || "Error al cerrar sesión")
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!isBrowser || !db || !user) {
      console.log("No se puede obtener el perfil: navegador, db o usuario no disponible")
      return null
    }

    try {
      console.log("Obteniendo perfil del usuario:", user.uid)
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const userData = docSnap.data()
        console.log("Perfil encontrado:", userData)
        return { id: docSnap.id, ...userData }
      } else {
        console.error("No se encontró el perfil del usuario en Firestore")
        return null
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      throw error
    }
  }

  const refreshUserProfile = async () => {
    if (!isBrowser || !db || !user) return

    try {
      const profile = await getUserProfile()
      setUserProfile(profile)
    } catch (error) {
      console.error("Error al refrescar perfil:", error)
    }
  }

  const updateUserProfile = async (data: any) => {
    if (!isBrowser || !db || !user) {
      throw new Error("La autenticación no está disponible en el servidor")
    }

    try {
      console.log("Actualizando perfil del usuario:", user.uid)
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )

      // Actualizar el perfil en el estado
      await refreshUserProfile()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
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
    updateUserProfile,
    refreshUserProfile,
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
