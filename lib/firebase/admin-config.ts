// Este archivo contiene la configuración para Firebase Admin
// Lo separamos para facilitar la depuración

export const getFirebaseAdminConfig = () => {
  // Verificar que todas las variables de entorno necesarias estén definidas
  const requiredEnvVars = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is not defined`)
    }
  }

  // Formatear la clave privada correctamente
  // A veces, las variables de entorno pueden tener problemas con los saltos de línea
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || ""

  // Si la clave no comienza con -----BEGIN PRIVATE KEY-----, es posible que necesite formateo
  if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    // Intentar reemplazar los literales \n con saltos de línea reales
    privateKey = privateKey.replace(/\\n/g, "\n")
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }
}
