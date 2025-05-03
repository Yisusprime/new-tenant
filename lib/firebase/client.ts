import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializar Firebase
let firebaseApp: FirebaseApp
let auth: Auth
let firestore: Firestore

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApps()[0]
}

auth = getAuth(firebaseApp)
firestore = getFirestore(firebaseApp)

// Funciones de autenticación
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    // Crear cookie de sesión
    await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    return userCredential.user
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }
}

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    // Crear cookie de sesión
    await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    })

    return userCredential.user
  } catch (error) {
    console.error("Error al registrarse:", error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)

    // Eliminar cookie de sesión
    await fetch("/api/auth/logout", {
      method: "POST",
    })

    return true
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    throw error
  }
}

export { auth, firestore }
