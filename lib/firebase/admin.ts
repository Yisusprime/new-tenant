import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

// Initialize the app only if it hasn't been initialized already
const apps = getApps()
const app =
  apps.length === 0
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
    : apps[0]

// Export the Firestore instance
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app
