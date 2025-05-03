import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Verificar si estamos en el navegador
const isBrowser = typeof window !== "undefined"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDSEdNRW_7-hGzNvBuMyAxWQuGzTsk--Fk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "multi-cliente.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "multi-cliente",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "multi-cliente.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "563434176386",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:563434176386:web:7aca513c0638b225b8d99b",
}

// Inicializar Firebase solo en el navegador
let app, auth, db, storage

if (isBrowser) {
  try {
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
