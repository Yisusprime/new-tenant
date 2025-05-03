import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializar Firebase solo en el navegador
let app, auth, db, storage

if (isBrowser) {
  try {
    // Verificar que la configuración sea válida
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
      console.error("Firebase API Key no está configurada correctamente. Verifica tus variables de entorno.")
    }

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
  } catch (error) {
    console.error("Error al inicializar Firebase:", error)
  }
}

export { app, auth, db, storage }
