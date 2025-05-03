import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar que la configuración sea válida
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
  console.error("Firebase API Key no está configurada correctamente. Verifica tus variables de entorno.")
}

// Inicializar Firebase solo una vez
let firebaseApp
if (!getApps().length) {
  try {
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase inicializado correctamente")
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
    throw error
  }
} else {
  firebaseApp = getApp()
}

export const app = firebaseApp
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
