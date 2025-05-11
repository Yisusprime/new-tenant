import * as admin from "firebase-admin"

// Verificar si ya hay una app inicializada
const apps = admin.apps

let firebaseAdmin: admin.app.App

if (!apps.length) {
  try {
    // Inicializar con credenciales
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || ""

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
        privateKey,
      } as admin.ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })

    console.log("Firebase Admin initialized successfully")
  } catch (error) {
    console.error("Firebase Admin initialization error:", error)

    // Si hay un error, crear una app con un nombre único
    firebaseAdmin = admin.initializeApp(
      {
        projectId: process.env.FIREBASE_PROJECT_ID,
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
