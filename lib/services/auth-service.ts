import { auth, db } from "../firebase/config"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import type { User } from "../models/tenant"

export async function signUp(email: string, password: string, name: string): Promise<User | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Actualizar el perfil con el nombre
    await updateProfile(firebaseUser, { displayName: name })

    // Crear el documento del usuario en Firestore
    const newUser: Omit<User, "id"> = {
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      isSuperAdmin: false,
    }

    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      id: firebaseUser.uid,
      ...newUser,
    }
  } catch (error) {
    console.error("Error signing up:", error)
    return null
  }
}

export async function signIn(email: string, password: string): Promise<FirebaseUser | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    return null
  }
}

export async function signOut(): Promise<boolean> {
  try {
    await firebaseSignOut(auth)
    return true
  } catch (error) {
    console.error("Error signing out:", error)
    return false
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  try {
    await sendPasswordResetEmail(auth, email)
    return true
  } catch (error) {
    console.error("Error resetting password:", error)
    return false
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", id))

    if (!userDoc.exists()) {
      return null
    }

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function createSuperAdmin(
  email: string,
  password: string,
  name: string,
  secretKey: string,
): Promise<User | null> {
  try {
    // Verificar la clave secreta
    if (secretKey !== process.env.SUPERADMIN_SECRET_KEY) {
      throw new Error("Invalid secret key")
    }

    const user = await signUp(email, password, name)

    if (!user) {
      throw new Error("Failed to create user")
    }

    // Actualizar el usuario como superadmin
    await setDoc(
      doc(db, "users", user.id),
      {
        ...user,
        isSuperAdmin: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    return {
      ...user,
      isSuperAdmin: true,
    }
  } catch (error) {
    console.error("Error creating super admin:", error)
    return null
  }
}
