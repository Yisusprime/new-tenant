import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Inicialización de Firebase Admin para el lado del servidor
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: "multi-cliente",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
      databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
    })
  }

  return getFirestore()
}

// Exportamos la instancia de Firestore para el servidor
export const adminDb = initializeFirebaseAdmin()
