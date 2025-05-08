import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { createTenant } from "./tenant-service"

interface RegisterData {
  email: string
  password: string
  name: string
  tenantName: string
  subdomain: string
}

interface LoginData {
  email: string
  password: string
}

export async function register(data: RegisterData): Promise<UserCredential> {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)

    const { user } = userCredential

    // Guardar información adicional del usuario en Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: data.name,
      createdAt: new Date(),
    })

    // Crear tenant para el usuario
    await createTenant({
      name: data.tenantName,
      ownerId: user.uid,
      subdomain: data.subdomain,
      status: "active",
    })

    return userCredential
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    throw error
  }
}

export async function login({ email, password }: LoginData): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}

export async function getCurrentUser() {
  const user = auth.currentUser
  if (!user) return null

  const userDoc = await getDoc(doc(db, "users", user.uid))
  return userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null
}
