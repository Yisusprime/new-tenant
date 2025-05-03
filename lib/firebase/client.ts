import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Usar valores de respaldo para desarrollo local si las variables de entorno no están disponibles
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "multi-cliente.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "multi-cliente",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "multi-cliente.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "563434176386",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Verificar que la configuración sea válida antes de inicializar
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
