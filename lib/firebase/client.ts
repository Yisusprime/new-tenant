import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Inicializar Firebase solo una vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Inicializar servicios
const auth = getAuth(app)
const firestore = getFirestore(app)
const db = firestore // Alias para mantener compatibilidad

// Conectar a emuladores en desarrollo si es necesario
if (process.env.NODE_ENV === "development") {
  // Descomentar estas líneas para usar emuladores locales
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(firestore, 'localhost', 8080)
}

export { app, auth, firestore, db }
