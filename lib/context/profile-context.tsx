"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/services/profile-service"
import { useAuth } from "@/lib/context/auth-context"

interface ProfileContextType {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  updateProfile: (
    profileData: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt" | "tenantId">>,
  ) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  error: null,
  updateProfile: async () => {},
})

export const useProfile = () => useContext(ProfileContext)

export function ProfileProvider({ children, tenantId }: { children: ReactNode; tenantId: string }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !tenantId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const userProfile = await getUserProfile(tenantId, user.uid)
        setProfile(userProfile)
      } catch (err) {
        console.error("Error al cargar perfil:", err)
        setError("No se pudo cargar la información del perfil")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, tenantId])

  const handleUpdateProfile = async (
    profileData: Partial<Omit<UserProfile, "userId" | "createdAt" | "updatedAt" | "tenantId">>,
  ) => {
    if (!user || !tenantId) {
      throw new Error("Usuario no autenticado o tenant no especificado")
    }

    try {
      setIsLoading(true)
      setError(null)

      const updatedProfile = await updateUserProfile(tenantId, user.uid, profileData)
      setProfile(updatedProfile)
    } catch (err) {
      console.error("Error al actualizar perfil:", err)
      setError("No se pudo actualizar la información del perfil")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile: handleUpdateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
