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
import { getApp } from "firebase/app"

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Solo inicializar Firebase en el cliente
  const [auth, setAuth] = useState<any>(null)
  const [db, setDb] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuth(getAuth(getApp()))
      setDb(getFirestore(getApp()))
    }
  }, [])

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  const signUp = async (email: string, password: string, displayName: string, companyName: string) => {
    try {
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

      await setDoc(doc(db, "tenants", tenantId), tenantData)

      // 5. Verificar si es el primer usuario (para asignar rol de superadmin)
      let isFirstUser = false
      try {
        const systemRef = doc(db, "system", "stats")
        const systemDoc = await getDoc(systemRef)

        // Solo asignar superadmin si es el primer usuario
        isFirstUser = !systemDoc.exists() || !systemDoc.data()?.userCount

        if (isFirstUser) {
          console.log("8. Es el primer usuario, asignando rol de superadmin")
          await updateDoc(doc(db, "users", user.uid), {
            role: "superadmin", // El primer usuario será superadmin
          })
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
        console.log("9. Estadísticas actualizadas")
      } catch (statsError) {
        console.error("Error al actualizar estadísticas:", statsError)
        // No interrumpir el proceso por este error
      }

      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        role: isFirstUser ? "superadmin" : "user",
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
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error: any) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string) => {
    try {
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
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      throw error
    }
  }

  const confirmPasswordResetUser = async (code: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, code, newPassword)
    } catch (error: any) {
      console.error("Error confirming password reset:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Facebook:", error)
      throw error
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      const provider = new OAuthProvider("microsoft.com")
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Microsoft:", error)
      throw error
    }
  }

  const getUserProfile = async () => {
    if (auth.currentUser) {
      try {
        const profile = await getUserProfileData(auth.currentUser.uid)
        setUserProfile(profile)
        return profile
      } catch (error) {
        console.error("Error getting user profile:", error)
        return null
      }
    }
    return null
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
