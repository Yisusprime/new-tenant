import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Verificar que las variables de entorno requeridas estén disponibles
const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
]

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar] || process.env[envVar] === "undefined")

if (missingEnvVars.length > 0) {
  console.error(`Faltan variables de entorno: ${missingEnvVars.join(", ")}`)
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializar Firebase solo en el navegador y si todas las variables de entorno están disponibles
let app, auth, db, storage

if (isBrowser && missingEnvVars.length === 0) {
  try {
    // Verificar que la configuración sea válida
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
      console.error("Firebase API Key no está configurada correctamente. Verifica tus variables de entorno.")
    } else {
      // Inicializar Firebase solo una vez
      if (!getApps().length) {
        app = initializeApp(firebaseConfig)
        console.log("Firebase inicializado correctamente")
      } else {
        app = getApp()
      }

      // Inicializar servicios
      auth = getAuth(app)
      db = getFirestore(app)
      storage = getStorage(app)
    }
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
  }
}

export { app, auth, db, storage }
