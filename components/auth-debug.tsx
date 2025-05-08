"use client"

import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const [authState, setAuthState] = useState<{
    user: any | null
    loading: boolean
    error: string | null
  }>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    console.log("AuthDebug component mounted")

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log("AuthDebug: Auth state changed", user ? `User: ${user.uid}` : "No user")
        setAuthState({
          user: user
            ? {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                isAnonymous: user.isAnonymous,
                metadata: {
                  creationTime: user.metadata.creationTime,
                  lastSignInTime: user.metadata.lastSignInTime,
                },
              }
            : null,
          loading: false,
          error: null,
        })
      },
      (error) => {
        console.error("AuthDebug: Auth state change error", error)
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        })
      },
    )

    return () => {
      console.log("AuthDebug component unmounted")
      unsubscribe()
    }
  }, [])

  const checkCurrentUser = () => {
    const currentUser = auth.currentUser
    console.log("Current user check:", currentUser)
    alert(currentUser ? `Current user: ${currentUser.uid}` : "No current user")
  }

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Loading: {authState.loading ? "Yes" : "No"}</p>
            <p className="font-semibold">Error: {authState.error || "None"}</p>
            <p className="font-semibold">User: {authState.user ? "Logged In" : "Not Logged In"}</p>
          </div>

          {authState.user && (
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="font-mono text-sm">User ID: {authState.user.uid}</p>
              <p className="font-mono text-sm">Email: {authState.user.email}</p>
              <p className="font-mono text-sm">Email Verified: {authState.user.emailVerified ? "Yes" : "No"}</p>
              <p className="font-mono text-sm">Anonymous: {authState.user.isAnonymous ? "Yes" : "No"}</p>
              <p className="font-mono text-sm">Created: {authState.user.metadata.creationTime}</p>
              <p className="font-mono text-sm">Last Sign In: {authState.user.metadata.lastSignInTime}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={checkCurrentUser}>Check Current User</Button>
            <Button variant="outline" onClick={reloadPage}>
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
