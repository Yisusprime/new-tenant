"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth"
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { app } from "@/lib/firebase/client"

export type UserRole = "superadmin" | "admin" | "manager" | "waiter" | "delivery" | "client" | "user"

interface AuthContextProps {
  user: any
  userProfile: any
  signUp: (email: string, password: string, displayName: string, companyName: string) => Promise<void>
  signUpTenantUser: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    tenantId: string,
  ) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (displayName: string) => Promise<void>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmPasswordResetUser: (code: string, newPassword: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
  getUserProfile: () => Promise<any>
  loading: boolean
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  userProfile: null,
  signUp: async () => {},
  signUpTenantUser: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  updateUserRole: async () => {},
  resetPassword: async () => {},
  confirmPasswordResetUser: async () => {},
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInWithMicrosoft: async () => {},
  getUserProfile: async () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

// Función para eliminar todas las cookies
const deleteAllCookies = () => {
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()

    // Eliminar todas las cookies relacionadas con Firebase
    if (name.includes("firebase") || name.includes("__session") || name.includes("auth")) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname

      // También intentar eliminar la cookie sin el dominio específico
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"

      // Intentar con diferentes dominios (para cubrir subdominios)
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + rootDomain
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + rootDomain
    }
  }

  // Limpiar localStorage y sessionStorage
  localStorage.clear()
  sessionStorage.clear()

  console.log("Todas las cookies y almacenamiento local han sido eliminados")
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Usar Firebase directamente desde el módulo client
  const auth = getAuth(app)
  const db = getFirestore(app)

  useEffect(() => {
    if (!auth) {
      console.error("Auth no está disponible")
      setLoading(false)
      return () => {}
    }

    console.log("Configurando listener de autenticación")
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No autenticado")
      if (user) {
        setUser(user)
        try {
          const profile = await getUserProfileData(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error loading user profile on auth change:", error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  const getUserProfileData = async (uid: string) => {
    try {
      if (!db) {
        console.error("Firestore no está disponible")
        return null
      }

      const userDoc = await getDoc(doc(db, "users", uid))
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
        }
      } else {
        console.warn("No user profile found in Firestore")
        return null
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }
  }

  // Función para verificar si estamos en el dominio principal
  const isMainDomain = () => {
    if (typeof window === "undefined") return true // Por defecto en SSR

    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Es dominio principal si es exactamente el dominio raíz o www.dominio
    return hostname === rootDomain || hostname === `www.${rootDomain}` || hostname === "localhost"
  }

  const signUp = async (email: string, password: string, displayName: string, companyName: string) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase no está inicializado correctamente")
      }

      console.log("Iniciando registro de usuario")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName })

      // Crear tenant
      const tenantId = companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const tenantData = {
        name: companyName,
        subdomain: tenantId,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      }

      console.log("Creando tenant:", tenantId)
      await setDoc(doc(db, "tenants", tenantId), tenantData)

      // Verificar si estamos en el dominio principal
      const mainDomain = isMainDomain()
      console.log("¿Es dominio principal?", mainDomain)

      // Verificar si es el primer usuario (para asignar rol de superadmin)
      let isFirstUser = false
      let userRole: UserRole = "user"

      try {
        const systemRef = doc(db, "system", "stats")
        const systemDoc = await getDoc(systemRef)

        // Solo asignar superadmin si es el primer usuario
        isFirstUser = !systemDoc.exists() || !systemDoc.data()?.userCount

        if (isFirstUser) {
          console.log("Es el primer usuario, asignando rol de superadmin")
          userRole = "superadmin"
        } else if (mainDomain) {
          // Si estamos en el dominio principal y no es el primer usuario, asignar rol de admin
          console.log("Registro en dominio principal, asignando rol de admin")
          userRole = "admin"
        }

        // Actualizar estadísticas
        await setDoc(
          systemRef,
          {
            userCount: (systemDoc.exists() ? systemDoc.data()?.userCount || 0 : 0) + 1,
            tenantCount: (systemDoc.exists() ? systemDoc.data()?.tenantCount || 0 : 0) + 1,
            lastRegistration: new Date().toISOString(),
          },
          { merge: true },
        )
        console.log("Estadísticas actualizadas")
      } catch (statsError) {
        console.error("Error al actualizar estadísticas:", statsError)
        // No interrumpir el proceso por este error
      }

      console.log("Guardando perfil de usuario con rol:", userRole)
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        role: userRole,
        tenantId: tenantId,
        isTenantOwner: true,
        companyName: companyName,
        createdAt: new Date().toISOString(),
      })

      setUser(user)
      const profile = await getUserProfileData(user.uid)
      setUserProfile(profile)
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signUpTenantUser = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    tenantId: string,
  ) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase no está inicializado correctamente")
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName })

      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        role: role,
        tenantId: tenantId,
        createdAt: new Date().toISOString(),
      })

      setUser(user)
      const profile = await getUserProfileData(user.uid)
      setUserProfile(profile)
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signOutUser = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      // Guardar información del dominio actual antes de cerrar sesión
      const currentHostname = window.location.hostname
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      const isSubdomain =
        currentHostname.includes(`.${rootDomain}`) ||
        (currentHostname.includes("localhost") && !currentHostname.startsWith("www") && currentHostname !== "localhost")

      // Extraer el subdominio si estamos en uno
      let subdomain = null
      if (isSubdomain) {
        if (currentHostname.includes(`.${rootDomain}`)) {
          subdomain = currentHostname.split(`.${rootDomain}`)[0]
        } else if (currentHostname.includes(".localhost")) {
          subdomain = currentHostname.split(".localhost")[0]
        }
      }

      // Primero, cerrar sesión en Firebase
      await signOut(auth)

      // Luego, eliminar todas las cookies y almacenamiento local
      deleteAllCookies()

      // Actualizar el estado local
      setUser(null)
      setUserProfile(null)

      console.log("Sesión cerrada y cookies eliminadas")

      // Redirigir según el contexto
      if (typeof window !== "undefined") {
        if (isSubdomain && subdomain) {
          // Si estamos en un subdominio, redirigir al login del tenant
          if (currentHostname.includes("localhost")) {
            window.location.href = `http://${subdomain}.localhost:3000/tenant/${subdomain}/login?clean=true`
          } else {
            window.location.href = `https://${subdomain}.${rootDomain}/tenant/${subdomain}/login?clean=true`
          }
        } else {
          // Si estamos en el dominio principal, redirigir al login principal
          if (currentHostname === "localhost") {
            window.location.href = `http://localhost:3000/login?clean=true`
          } else {
            window.location.href = `https://www.${rootDomain}/login?clean=true`
          }
        }
      }
    } catch (error: any) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string) => {
    try {
      if (!auth || !db) {
        throw new Error("Firebase no está inicializado correctamente")
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName })
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          displayName,
        })
        setUser(auth.currentUser)
        const profile = await getUserProfileData(auth.currentUser.uid)
        setUserProfile(profile)
      }
    } catch (error: any) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      if (!db) {
        throw new Error("Firestore no está inicializado correctamente")
      }

      await updateDoc(doc(db, "users", userId), {
        role: role,
      })
    } catch (error: any) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  const confirmPasswordResetUser = async (code: string, newPassword: string) => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      await confirmPasswordReset(auth, code, newPassword)
    } catch (error: any) {
      console.error("Error confirming password reset:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithFacebook = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Facebook:", error)
      throw error
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth no está inicializado correctamente")
      }

      const provider = new OAuthProvider("microsoft.com")
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Microsoft:", error)
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!auth || !auth.currentUser) {
      return null
    }

    try {
      const profile = await getUserProfileData(auth.currentUser.uid)
      setUserProfile(profile)
      return profile
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  const value = {
    user,
    userProfile,
    signUp,
    signUpTenantUser,
    signIn,
    signOut: signOutUser,
    updateUserProfile,
    updateUserRole,
    resetPassword,
    confirmPasswordResetUser,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    getUserProfile,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
