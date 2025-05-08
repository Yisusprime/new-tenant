import * as admin from "firebase-admin"
import { getFirebaseAdminConfig } from "./admin-config"

// Verificar si ya hay una app inicializada
const apps = admin.apps

let firebaseAdmin: admin.app.App

if (!apps.length) {
  try {
    // Obtener la configuración
    const config = getFirebaseAdminConfig()

    // Inicializar la app
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      } as admin.ServiceAccount),
      storageBucket: config.storageBucket,
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)

    // Si hay un error, intentar inicializar con un enfoque alternativo
    const projectId = process.env.FIREBASE_PROJECT_ID || ""
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || ""
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || ""

    firebaseAdmin = admin.initializeApp(
      {
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        } as admin.ServiceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      },
      "admin-app-" + Date.now(),
    )
  }
} else {
  // Usar la app existente
  firebaseAdmin = admin.app()
}

// Exportar servicios
export const adminAuth = firebaseAdmin.auth()
export const adminDb = firebaseAdmin.firestore()
export const adminStorage = firebaseAdmin.storage()

export default firebaseAdmin
