"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getProfileByUserId } from "@/lib/services/profile-service"

export function useUser() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || isAuthLoading) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const userProfile = await getProfileByUserId(user.uid)
        setProfile(userProfile)
        setError(null)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err)
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, isAuthLoading])

  return {
    user,
    profile,
    isLoading: isLoading || isAuthLoading,
    error,
  }
}
