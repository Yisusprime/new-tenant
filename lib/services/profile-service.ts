import { db, storage } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { auth } from "@/lib/firebase/client"

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
  tenantId?: string
}

// Get user profile from the tenant structure
export async function getUserProfile(userId: string, tenantId?: string): Promise<UserProfile | null> {
  try {
    console.log(`Getting user profile for userId: ${userId}, tenantId: ${tenantId}`)

    // First try to get the user from the global users collection
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    // If the user exists in the global collection, return it
    if (userDoc.exists()) {
      console.log("Found user profile in global users collection")
      return userDoc.data() as UserProfile
    }

    // If tenantId is provided, try to get the user from the tenant's users collection
    if (tenantId) {
      console.log(`Checking tenant users collection for tenantId: ${tenantId}`)
      const tenantUserRef = doc(db, `tenants/${tenantId}/users`, userId)
      const tenantUserDoc = await getDoc(tenantUserRef)

      if (tenantUserDoc.exists()) {
        console.log("Found user profile in tenant users collection")
        return tenantUserDoc.data() as UserProfile
      }

      // If we still don't have a user profile, check the tenant's roles collection
      console.log("Checking tenant roles collection")
      const roleRef = doc(db, `tenants/${tenantId}/roles`, userId)
      const roleDoc = await getDoc(roleRef)

      if (roleDoc.exists()) {
        console.log("Found user in tenant roles collection, creating profile")
        const roleData = roleDoc.data()

        // Get user data from Firebase Auth if possible
        const authUser = auth.currentUser

        // Create a default profile based on role data and auth user
        const defaultProfile: UserProfile = {
          id: userId,
          displayName: authUser?.displayName || "",
          email: roleData.email || authUser?.email || "",
          phoneNumber: authUser?.phoneNumber || "",
          photoURL: authUser?.photoURL || "",
          position: roleData.role || "admin", // Use role from roles collection
          tenantId: tenantId,
          createdAt: roleData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Save the default profile to the tenant's users collection
        await setDoc(tenantUserRef, defaultProfile)

        // Also save to global users collection for future reference
        await setDoc(userRef, {
          ...defaultProfile,
          tenants: [tenantId], // Keep track of which tenants this user belongs to
        })

        return defaultProfile
      }
    }

    console.log("No user profile found, creating default profile")

    // If we still don't have a profile, create a default one
    const authUser = auth.currentUser

    if (!authUser) {
      console.log("No authenticated user found")
      return null
    }

    // Create a default profile
    const defaultProfile: UserProfile = {
      id: userId,
      displayName: authUser.displayName || "",
      email: authUser.email || "",
      phoneNumber: authUser.phoneNumber || "",
      photoURL: authUser.photoURL || "",
      tenantId: tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save the default profile
    await setDoc(userRef, defaultProfile)

    // If tenantId is provided, also save to tenant's users collection
    if (tenantId) {
      const tenantUserRef = doc(db, `tenants/${tenantId}/users`, userId)
      await setDoc(tenantUserRef, defaultProfile)
    }

    return defaultProfile
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Create or update user profile
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>,
  tenantId?: string,
): Promise<UserProfile> {
  try {
    const now = new Date().toISOString()

    // Update in global users collection
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    // If tenantId is provided, also update in tenant's users collection
    let tenantUserRef
    let tenantUserDoc

    if (tenantId) {
      tenantUserRef = doc(db, `tenants/${tenantId}/users`, userId)
      tenantUserDoc = await getDoc(tenantUserRef)
    }

    // If neither exists, get or create the profile first
    if (!userDoc.exists() && (!tenantUserRef || !tenantUserDoc?.exists())) {
      await getUserProfile(userId, tenantId)
    }

    // Update with new data
    const updatedProfile = {
      ...profileData,
      updatedAt: now,
    }

    // Update in global users collection
    await updateDoc(userRef, updatedProfile)

    // If tenantId is provided, also update in tenant's users collection
    if (tenantId && tenantUserRef) {
      await updateDoc(tenantUserRef, updatedProfile)
    }

    // Return the full updated profile
    return (await getUserProfile(userId, tenantId)) as UserProfile
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Upload profile photo
export async function uploadProfilePhoto(userId: string, file: File, tenantId?: string): Promise<string> {
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `users/${userId}/profile-photo`)

    // Upload the file
    await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef)

    // Update the user profile with the new photo URL
    await updateUserProfile(userId, { photoURL: downloadURL }, tenantId)

    return downloadURL
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    throw error
  }
}

// Delete profile photo
export async function deleteProfilePhoto(userId: string, tenantId?: string): Promise<void> {
  try {
    // Get the current profile
    const profile = await getUserProfile(userId, tenantId)

    if (!profile?.photoURL) {
      return
    }

    // Delete the file from storage
    const storageRef = ref(storage, `users/${userId}/profile-photo`)
    await deleteObject(storageRef)

    // Update the profile to remove the photo URL
    await updateUserProfile(userId, { photoURL: "" }, tenantId)
  } catch (error) {
    console.error("Error deleting profile photo:", error)
    throw error
  }
}
