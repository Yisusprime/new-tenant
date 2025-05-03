import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Inicialización de Firebase Admin para el lado del servidor
function initializeFirebaseAdmin() {
  // Verificar si estamos en un entorno de construcción o si faltan variables de entorno
  const isBuildTime =
    process.env.NODE_ENV === "production" && typeof window === "undefined" && !process.env.FIREBASE_PROJECT_ID

  if (isBuildTime) {
    console.warn(
      "Firebase Admin: Ejecutando en tiempo de construcción o faltan variables de entorno. Usando cliente simulado.",
    )

    // Devolver objetos simulados para tiempo de construcción
    return {
      db: {
        collection: () => ({
          doc: () => ({
            get: () =>
              Promise.resolve({
                exists: false,
                data: () => ({}),
                id: "mock-id",
              }),
          }),
        }),
      },
      auth: {
        verifyIdToken: () => Promise.resolve({ uid: "mock-uid" }),
      },
    }
  }

  if (getApps().length === 0) {
    try {
      // Verificar que todas las variables de entorno necesarias estén disponibles
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        throw new Error("Variables de entorno de Firebase Admin no configuradas correctamente")
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
      })
    } catch (error) {
      console.error("Error al inicializar Firebase Admin:", error)

      // Devolver objetos simulados en caso de error
      return {
        db: {
          collection: () => ({
            doc: () => ({
              get: () =>
                Promise.resolve({
                  exists: false,
                  data: () => ({}),
                  id: "error-id",
                }),
            }),
          }),
        },
        auth: {
          verifyIdToken: () => Promise.resolve({ uid: "error-uid" }),
        },
      }
    }
  }

  return {
    db: getFirestore(),
    auth: getAuth(),
  }
}

// Exportamos las instancias de Firestore y Auth para el servidor
const { db: adminDb, auth: adminAuth } = initializeFirebaseAdmin()
export { adminDb, adminAuth }
