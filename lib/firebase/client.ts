import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Asegúrate de que todas las variables de entorno estén definidas
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar que las variables de entorno estén definidas
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    "Firebase config is missing or incomplete:",
    Object.keys(firebaseConfig).filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]),
  )
}

// Inicializar Firebase solo una vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Inicializar servicios
const auth = getAuth(app)
const firestore = getFirestore(app)
const db = firestore // Alias para mantener compatibilidad

// Conectar a emuladores en desarrollo si es necesario
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  // Descomentar estas líneas para usar emuladores locales
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(firestore, 'localhost', 8080)
}

export { app, auth, firestore, db }
