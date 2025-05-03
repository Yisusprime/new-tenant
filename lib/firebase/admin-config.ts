import { initializeApp, getApps, cert, type App } from "firebase-admin/app"

// Función para inicializar Firebase Admin de manera segura
export function initializeFirebaseAdmin(): App | undefined {
  try {
    if (getApps().length > 0) {
      return getApps()[0]
    }

    // Verificar que todas las variables de entorno necesarias estén presentes
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Faltan variables de entorno para Firebase Admin")
      return undefined
    }

    // Procesar la clave privada correctamente
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    })
  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error)
    return undefined
  }
}
