import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { initializeFirebaseAdmin } from "./admin-config"

// Inicializar Firebase Admin de manera segura
const app = initializeFirebaseAdmin()

// Exportar las instancias de auth y firestore solo si la inicialización fue exitosa
const auth = app ? getAuth(app) : null
const firestore = app ? getFirestore(app) : null

export { auth, firestore }

// Función auxiliar para verificar si Firebase Admin está inicializado
export function isFirebaseAdminInitialized(): boolean {
  return !!app
}
