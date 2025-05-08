import { db, storage } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface UserProfile {
  id: string
  displayName: string
  email: string
  phoneNumber?: string
  bio?: string
  photoURL?: string
  position?: string
  address?: string
  createdAt: string
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

// Create or update user profile
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    const now = new Date().toISOString()

    if (!userDoc.exists()) {
      // Create new profile
      const newProfile: UserProfile = {
        id: userId,
        displayName: profileData.displayName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        bio: profileData.bio || "",
        photoURL: profileData.photoURL || "",
        position: profileData.position || "",
        address: profileData.address || "",
        createdAt: now,
        updatedAt: now,
        ...profileData,
      }

      await setDoc(userRef, newProfile)
      return newProfile
    } else {
      // Update existing profile
      const updatedProfile = {
        ...userDoc.data(),
        ...profileData,
        updatedAt: now,
      }

      await updateDoc(userRef, updatedProfile)
      return updatedProfile as UserProfile
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
    // Get the current profile
    const profile = await getUserProfile(userId)

    if (!profile?.photoURL) {
      return
    }

    // Delete the file from storage
    const storageRef = ref(storage, `users/${userId}/profile-photo`)
    await deleteObject(storageRef)

    // Update the profile to remove the photo URL
    await updateUserProfile(userId, { photoURL: "" })
  } catch (error) {
    console.error("Error deleting profile photo:", error)
    throw error
  }
}
