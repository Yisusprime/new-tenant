import { db } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

export interface UserProfile {
  userId: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  position?: string
  bio?: string
  createdAt: string
  updatedAt: string
  tenantId: string
}

// Función para obtener el perfil de un usuario
export async function getUserProfile(tenantId: string, userId: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, `tenants/${tenantId}/profiles`, userId))

    if (!profileDoc.exists()) {
      return null
    }

    return profileDoc.data() as UserProfile
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error)
    return null
  }
}

// Función para crear o actualizar el perfil de un usuario
export async function updateUserProfile(
  tenantId: string,
  userId: string,
  profileData: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt" | "tenantId">>,
): Promise<UserProfile> {
  try {
    const now = new Date().toISOString()
    const profileRef = doc(db, `tenants/${tenantId}/profiles`, userId)
    const profileDoc = await getDoc(profileRef)

    if (!profileDoc.exists()) {
      // Crear nuevo perfil
      const newProfile: UserProfile = {
        userId,
        ...profileData,
        createdAt: now,
        updatedAt: now,
        tenantId,
      }

      await setDoc(profileRef, newProfile)
      return newProfile
    } else {
      // Actualizar perfil existente
      const updatedProfile = {
        ...profileDoc.data(),
        ...profileData,
        updatedAt: now,
      }

      await updateDoc(profileRef, updatedProfile)
      return updatedProfile as UserProfile
    }
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error)
    throw error
  }
}
