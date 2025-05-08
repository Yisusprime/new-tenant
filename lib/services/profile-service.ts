import { db, storage } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface UserProfile {
  userId: string
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  position?: string
  bio?: string
  address?: string
  socialLinks?: {
    website?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  preferences?: {
    notifications?: boolean
    darkMode?: boolean
    language?: string
  }
  updatedAt: string
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
    throw error
  }
}

// Función para crear o actualizar el perfil de un usuario
export async function updateUserProfile(
  tenantId: string,
  userId: string,
  profileData: Partial<UserProfile>,
): Promise<UserProfile> {
  try {
    const profileRef = doc(db, `tenants/${tenantId}/profiles`, userId)
    const profileDoc = await getDoc(profileRef)

    const updatedProfile: UserProfile = {
      userId,
      updatedAt: new Date().toISOString(),
      ...(profileDoc.exists() ? (profileDoc.data() as UserProfile) : {}),
      ...profileData,
    }

    if (profileDoc.exists()) {
      await updateDoc(profileRef, updatedProfile)
    } else {
      await setDoc(profileRef, updatedProfile)
    }

    return updatedProfile
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error)
    throw error
  }
}

// Función para subir una imagen de perfil
export async function uploadProfileImage(tenantId: string, userId: string, file: File): Promise<string> {
  try {
    // Crear una referencia al archivo en Storage
    const storageRef = ref(storage, `tenants/${tenantId}/profiles/${userId}/profile-image`)

    // Subir el archivo
    await uploadBytes(storageRef, file)

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef)

    // Actualizar el perfil con la nueva URL
    await updateUserProfile(tenantId, userId, {
      photoURL: downloadURL,
    })

    return downloadURL
  } catch (error) {
    console.error("Error al subir imagen de perfil:", error)
    throw error
  }
}

// Función para eliminar la imagen de perfil
export async function deleteProfileImage(tenantId: string, userId: string): Promise<void> {
  try {
    // Crear una referencia al archivo en Storage
    const storageRef = ref(storage, `tenants/${tenantId}/profiles/${userId}/profile-image`)

    // Eliminar el archivo
    await deleteObject(storageRef)

    // Actualizar el perfil para quitar la URL
    await updateUserProfile(tenantId, userId, {
      photoURL: "",
    })
  } catch (error) {
    console.error("Error al eliminar imagen de perfil:", error)
    throw error
  }
}
