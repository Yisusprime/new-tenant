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
const requiredEnvVars = ["apiKey", "authDomain", "projectId"]
const missingEnvVars = requiredEnvVars.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig])

if (missingEnvVars.length > 0) {
  console.error("Firebase config is missing required variables:", missingEnvVars)

  // En desarrollo, mostrar un mensaje más detallado
  if (process.env.NODE_ENV === "development") {
    console.error(
      "Please make sure the following environment variables are defined in your .env.local file:",
      missingEnvVars.map((key) => {
        switch (key) {
          case "apiKey":
            return "NEXT_PUBLIC_FIREBASE_API_KEY"
          case "authDomain":
            return "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
          case "projectId":
            return "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
          default:
            return `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`
        }
      }),
    )
  }
}

// Inicializar Firebase solo una vez y con manejo de errores
let app
let auth
let firestore
let db

try {
  // Inicializar Firebase solo una vez
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

  // Inicializar servicios
  auth = getAuth(app)
  firestore = getFirestore(app)
  db = firestore // Alias para mantener compatibilidad

  console.log("Firebase inicializado correctamente")
} catch (error) {
  console.error("Error al inicializar Firebase:", error)

  // Crear objetos vacíos para evitar errores de referencia nula
  if (!app) app = {} as any
  if (!auth) auth = {} as any
  if (!firestore) firestore = {} as any
  if (!db) db = {} as any
}

// Conectar a emuladores en desarrollo si es necesario
if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  // Descomentar estas líneas para usar emuladores locales
  // connectAuthEmulator(auth, 'http://localhost:9099')
  // connectFirestoreEmulator(firestore, 'localhost', 8080)
}

export { app, auth, firestore, db }
