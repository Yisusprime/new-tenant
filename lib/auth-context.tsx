"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth, db } from "./firebase"
import { setDoc, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "client" | "waiter" | "delivery" | "manager" | "user"

// Crear un tipo para el contexto de autenticación
type AuthContextType = {
  user: any
  userProfile: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, companyName: string) => Promise<void>
  signUpTenantUser: (email: string, password: string, name: string, role: UserRole, tenantId: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL: string) => Promise<void>
  updateUserRole: (userId: string, role: UserRole) => Promise<void>
  getUserProfile: () => Promise<any>
}

// Crear el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Función para detectar el subdominio actual
  const getCurrentTenantId = () => {
    if (typeof window === "undefined") return null

    const hostname = window.location.hostname
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Verificar si es un subdominio del dominio raíz
    if (hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      if (subdomain !== "www" && subdomain !== "app") {
        return subdomain
      }
    }

    // Para desarrollo local
    if (hostname.includes("localhost")) {
      const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
      if (subdomainMatch) {
        const subdomain = subdomainMatch[1]
        if (subdomain !== "www" && subdomain !== "app") {
          return subdomain
        }
      }
    }

    return null
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Fetch user profile
        try {
          const profile = await getUserProfileData(user.uid)

          // Si estamos en un subdominio, verificar que el usuario pertenece a este tenant
          const currentTenantId = getCurrentTenantId()
          if (currentTenantId && profile && profile.tenantId !== currentTenantId) {
            console.log(`Usuario no pertenece al tenant ${currentTenantId}. Buscando perfil alternativo...`)

            // Buscar si el usuario tiene un perfil asociado a este tenant
            const tenantProfile = await getUserProfileForTenant(user.uid, currentTenantId)

            if (tenantProfile) {
              console.log("Perfil encontrado para este tenant:", tenantProfile)
              setUserProfile(tenantProfile)
            } else {
              console.log("Usuario no tiene acceso a este tenant")
              setUserProfile(profile) // Usar el perfil original
            }
          } else {
            setUserProfile(profile)
          }
        } catch (error) {
          console.error("Error al obtener perfil de usuario:", error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // No need to redirect here, useEffect will handle user state change
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  // Modificar la función signUp para asegurar que el perfil se crea correctamente
  const signUp = async (email: string, password: string, name: string, companyName: string) => {
    try {
      console.log("1. Iniciando registro...")

      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("2. Usuario creado en Auth:", user.uid)

      // 2. Generate a unique subdomain from company name
      const subdomain = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 20)
      console.log("3. Subdomain generado:", subdomain)

      // 3. Crear el perfil de usuario en Firestore
      const userData = {
        email,
        name,
        companyName,
        subdomain,
        role: "user", // Por defecto, asignar rol de usuario
        isTenantOwner: true,
        tenantId: subdomain,
        createdAt: new Date().toISOString(),
      }

      console.log("4. Creando perfil de usuario:", userData)
      await setDoc(doc(db, "users", user.uid), userData)
      console.log("5. Perfil de usuario creado exitosamente")

      // 4. Crear el tenant
      const tenantData = {
        ownerId: user.uid,
        name: companyName,
        subdomain,
        customDomain: null,
        active: true,
        createdAt: new Date().toISOString(),
      }

      console.log("6. Creando tenant:", tenantData)
      await setDoc(doc(db, "tenants", subdomain), tenantData)
      console.log("7. Tenant creado exitosamente")

      // 5. Verificar si es el primer usuario (para asignar rol de admin)
      let isFirstUser = false
      try {
        const systemRef = doc(db, "system", "stats")
        const systemDoc = await getDoc(systemRef)

        isFirstUser = !systemDoc.exists() || !systemDoc.data()?.userCount

        if (isFirstUser) {
          console.log("8. Es el primer usuario, asignando rol de admin")
          await updateDoc(doc(db, "users", user.uid), {
            role: "admin",
          })
        }

        // Actualizar estadísticas
        await setDoc(
          systemRef,
          {
            userCount: (systemDoc.exists() ? systemDoc.data()?.userCount || 0 : 0) + 1,
            lastRegistration: new Date().toISOString(),
          },
          { merge: true },
        )
        console.log("9. Estadísticas actualizadas")
      } catch (statsError) {
        console.error("Error al actualizar estadísticas:", statsError)
        // No interrumpir el proceso por este error
      }

      console.log("10. Registro completado con éxito")

      // Actualizar el estado local con el nuevo usuario
      setUserProfile({
        ...userData,
        role: isFirstUser ? "admin" : "user",
      })

      // No redirigir automáticamente, dejar que el router de Next.js maneje la redirección
      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signUpTenantUser = async (email: string, password: string, name: string, role: UserRole, tenantId: string) => {
    try {
      console.log(`Registrando usuario ${name} como ${role} en tenant ${tenantId}`)

      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("Usuario creado en Auth:", user.uid)

      // 2. Crear el perfil de usuario en Firestore
      const userData = {
        email,
        name,
        role,
        tenantId,
        createdAt: new Date().toISOString(),
        // Si es cliente, no es dueño del tenant
        isTenantOwner: false,
      }

      console.log("Creando perfil de usuario:", userData)
      await setDoc(doc(db, "users", user.uid), userData)
      console.log("Perfil de usuario creado exitosamente")

      return user
    } catch (error) {
      console.error("Error signing up tenant user:", error)
      throw error
    }
  }

  // Renombrar a signOut para consistencia y usar firebaseSignOut para evitar conflictos
  const signOut = async () => {
    try {
      console.log("Cerrando sesión...")

      // Obtener el hostname actual para determinar si estamos en un subdominio
      const hostname = typeof window !== "undefined" ? window.location.hostname : ""
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      const isSubdomain = hostname.endsWith(`.${rootDomain}`) && !hostname.startsWith("www.") && hostname !== rootDomain

      // Limpiar el estado de autenticación
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)

      // Redirigir según el contexto
      if (isSubdomain) {
        // Si estamos en un subdominio, redirigir a la página principal del subdominio
        router.push("/")
      } else {
        // Si estamos en el dominio principal, redirigir a la página principal
        router.push("/")
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName, photoURL) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL,
      })
      setUser(auth.currentUser) // Update local state
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: role,
      })
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  const getUserProfile = async () => {
    if (!user) return null

    try {
      // Primero intentamos obtener el perfil principal del usuario
      const profile = await getUserProfileData(user.uid)

      // Si estamos en un subdominio, verificar que el usuario pertenece a este tenant
      const currentTenantId = getCurrentTenantId()
      if (currentTenantId && profile && profile.tenantId !== currentTenantId) {
        console.log(`Usuario no pertenece al tenant ${currentTenantId}. Buscando perfil alternativo...`)

        // Buscar si el usuario tiene un perfil asociado a este tenant
        const tenantProfile = await getUserProfileForTenant(user.uid, currentTenantId)

        if (tenantProfile) {
          console.log("Perfil encontrado para este tenant:", tenantProfile)
          return tenantProfile
        }
      }

      return profile
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  const getUserProfileData = async (uid: string) => {
    try {
      console.log(`Obteniendo perfil para usuario: ${uid}`)
      const userDoc = await getDoc(doc(db, "users", uid))

      if (userDoc.exists()) {
        console.log("Perfil encontrado:", userDoc.data())
        return userDoc.data()
      } else {
        console.log("No se encontró el documento del usuario")
        return null
      }
    } catch (error) {
      console.error("Error getting document:", error)
      return null
    }
  }

  // Nueva función para buscar perfiles de usuario asociados a un tenant específico
  const getUserProfileForTenant = async (uid: string, tenantId: string) => {
    try {
      console.log(`Buscando perfil para usuario ${uid} en tenant ${tenantId}`)

      // Buscar en la colección de usuarios por UID y tenantId
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("tenantId", "==", tenantId))
      const querySnapshot = await getDocs(q)

      // Verificar si hay algún documento que coincida
      for (const doc of querySnapshot.docs) {
        if (doc.id === uid) {
          console.log("Perfil encontrado para este tenant:", doc.data())
          return doc.data()
        }
      }

      console.log("No se encontró perfil para este tenant")
      return null
    } catch (error) {
      console.error("Error buscando perfil para tenant:", error)
      return null
    }
  }

  const value = {
    user,
    userProfile,
    signIn,
    signUp,
    signUpTenantUser,
    signOut, // Usar signOut en lugar de logOut
    loading,
    resetPassword,
    updateUserProfile,
    updateUserRole,
    getUserProfile,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
