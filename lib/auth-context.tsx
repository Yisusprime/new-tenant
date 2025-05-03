"use client"

import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { app } from "./firebase"
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/router"

const auth = getAuth(app)
const db = getFirestore(app)

type AuthContextType = {
  user: FirebaseUser | null
  userProfile: any | null // Replace 'any' with a more specific type if possible
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: () => Promise.resolve(),
})

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<any | null>(null) // Replace 'any' with a more specific type
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isBrowser = typeof window !== "undefined"

  useEffect(() => {
    let isMounted = true // Add a flag to track component mount status

    if (isBrowser) {
      onAuthStateChanged(auth, async (user) => {
        if (isMounted) {
          setUser(user)

          if (user) {
            try {
              const profile = await getUserProfile()
              console.log("Perfil de usuario cargado:", profile)

              if (!profile) {
                console.warn("Perfil no encontrado, verificando si existe en Firestore")

                // Intentar obtener el perfil directamente de Firestore una vez más
                try {
                  const docRef = doc(db, "users", user.uid)
                  const docSnap = await getDoc(docRef)

                  if (docSnap.exists()) {
                    const userData = docSnap.data()
                    console.log("Perfil recuperado directamente:", userData)
                    setUserProfile({ id: docSnap.id, ...userData })
                  } else {
                    // Si realmente no existe, crear un perfil básico
                    console.warn("Creando perfil básico nuevo")
                    const basicProfile = {
                      email: user.email,
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                      role: "user", // Rol por defecto para usuarios nuevos
                    }

                    await setDoc(doc(db, "users", user.uid), basicProfile)
                    setUserProfile(basicProfile)
                  }
                } catch (innerError) {
                  console.error("Error al intentar recuperar perfil directamente:", innerError)
                  setUserProfile(null)
                }
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
        }
      })
    }

    return () => {
      isMounted = false // Set the flag to false when the component unmounts
    }
  }, [isBrowser])

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
        console.warn("No se encontró el perfil del usuario en Firestore")
        return null
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setUserProfile(null)
      router.push("/login") // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = { user, userProfile, loading, signOut }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
