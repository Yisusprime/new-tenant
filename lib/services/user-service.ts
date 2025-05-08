import { db, storage } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface UserProfile {
  id: string
  displayName?: string
  email: string
  photoURL?: string
  phone?: string
  position?: string
  bio?: string
  updatedAt: string
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return null
    }

    return userDoc.data() as UserProfile
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString(),
      })
    } else {
      await setDoc(userRef, {
        id: userId,
        ...profileData,
        updatedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Upload profile photo
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `users/${userId}/profile-photo`)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)

    // Update the user profile with the new photo URL
    await updateUserProfile(userId, { photoURL: downloadURL })

    return downloadURL
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    throw error
  }
}

// Delete profile photo
export async function deleteProfilePhoto(userId: string): Promise<void> {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `users/${userId}/profile-photo`)

    // Delete the file
    await deleteObject(storageRef)

    // Update the user profile to remove the photo URL
    await updateUserProfile(userId, { photoURL: null })
  } catch (error) {
    console.error("Error deleting profile photo:", error)
    // If the file doesn't exist, just update the profile
    await updateUserProfile(userId, { photoURL: null })
  }
}
