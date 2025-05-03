import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Configuración para Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Reemplazar los caracteres de escape en la clave privada
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
}

// Inicializar Firebase Admin solo una vez
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig)

// Inicializar servicios
const adminAuth = getAuth(app)
const adminFirestore = getFirestore(app)

export { app as adminApp, adminAuth, adminFirestore }
