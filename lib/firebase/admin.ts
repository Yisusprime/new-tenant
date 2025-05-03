import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Inicialización de Firebase Admin para el lado del servidor
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
    })
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
  }
}

// Exportamos las instancias de Firestore y Auth para el servidor
const { db: adminDb, auth: adminAuth } = initializeFirebaseAdmin()
export { adminDb, adminAuth }
