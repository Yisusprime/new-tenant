// Este archivo solo se ejecutará en el servidor
import * as admin from "firebase-admin"

// Inicializar Firebase Admin solo una vez
let firebaseAdmin: admin.app.App | undefined

if (!firebaseAdmin && typeof window === "undefined") {
  // Solo inicializar en el servidor
  const serviceAccount = {
    projectId: "multi-cliente",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }

  try {
    if (admin.apps.length === 0) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
      })
    } else {
      firebaseAdmin = admin.app()
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error)
  }
}

export default firebaseAdmin
export const db = firebaseAdmin ? firebaseAdmin.firestore() : undefined
