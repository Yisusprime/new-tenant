// Función para obtener la instancia de Firebase Admin
let adminDb: any = null

export async function getAdminDb() {
  if (adminDb) {
    return adminDb
  }

  try {
    const admin = await import("firebase-admin")

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: "multi-cliente",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
        databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
      })
    }

    adminDb = admin.firestore()
    return adminDb
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
    throw error
  }
}

// Para mantener compatibilidad con el código existente
export const adminApp = null // Será reemplazado por la importación dinámica
//export const adminDb = null; // Será reemplazado por la importación dinámica
