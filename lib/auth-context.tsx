"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth, db } from "./firebase"
import { setDoc, doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "client" | "waiter" | "delivery" | "manager" | "user"

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        // Fetch user profile
        const profile = await getUserProfileData(user.uid)
        setUserProfile(profile)
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
      try {
        const systemRef = doc(db, "system", "stats")
        const systemDoc = await getDoc(systemRef)

        const isFirstUser = !systemDoc.exists() || !systemDoc.data()?.userCount

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

      // Redirigir al subdominio del tenant
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
      window.location.href = `https://${subdomain}.${rootDomain}/dashboard`
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signUpTenantUser = async (email: string, password: string, name: string, role: UserRole, tenantId: string) => {
    try {
      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 2. Crear el perfil de usuario en Firestore
      const userData = {
        email,
        name,
        role,
        tenantId,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, "users", user.uid), userData)

      return user
    } catch (error) {
      console.error("Error signing up tenant user:", error)
      throw error
    }
  }

  const logOut = async () => {
    setUser(null)
    setUserProfile(null)
    await signOut(auth)
    router.push("/")
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  const updateUserProfileData = async (displayName, photoURL) => {
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
      return await getUserProfileData(user.uid)
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  const getUserProfileData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid))

      if (userDoc.exists()) {
        return userDoc.data()
      } else {
        console.log("No such document!")
        return null
      }
    } catch (error) {
      console.error("Error getting document:", error)
      return null
    }
  }

  const value = {
    user,
    userProfile,
    signIn,
    signUp,
    signUpTenantUser,
    logOut,
    loading,
    resetPassword,
    updateUserProfile: updateUserProfileData,
    updateUserRole,
    getUserProfile,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
