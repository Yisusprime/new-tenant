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

  // Verificar si estamos en el navegador
  if (typeof window !== "undefined") {
    console.warn("Firebase Admin: No se puede usar en el cliente. Usando cliente simulado.")

    // Devolver objetos simulados para el cliente
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

  try {
    // Verificar si ya hay una instancia de Firebase Admin
    if (getApps().length === 0) {
      // Verificar que todas las variables de entorno necesarias estén disponibles
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn("Variables de entorno de Firebase Admin no configuradas correctamente. Usando cliente simulado.")

        // Devolver objetos simulados si faltan variables de entorno
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

      // Inicializar Firebase Admin
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
      })
    }

    // Devolver instancias reales de Firestore y Auth
    return {
      db: getFirestore(),
      auth: getAuth(),
    }
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

// Exportamos las instancias de Firestore y Auth para el servidor
const { db: adminDb, auth: adminAuth } = initializeFirebaseAdmin()
export { adminDb, adminAuth }
