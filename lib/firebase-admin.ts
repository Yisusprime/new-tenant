import * as admin from "firebase-admin"

// Verificar si Firebase Admin ya está inicializado
function getFirebaseAdmin() {
  if (!admin.apps.length) {
    // Inicializar Firebase Admin con credenciales
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "multi-cliente",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
        // Reemplazar los caracteres de escape con saltos de línea reales
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
      databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
    })
  }

  return admin
}

// Exportar la instancia de Firestore para el servidor
export const adminApp = getFirebaseAdmin()
export const adminDb = getFirebaseAdmin().firestore()
