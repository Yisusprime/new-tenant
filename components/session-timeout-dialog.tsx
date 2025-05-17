"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { parseCookies } from "nookies"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Warning will show 2 minutes before session expires
const WARNING_BEFORE_TIMEOUT = 2 * 60 * 1000 // 2 minutes in milliseconds
const SESSION_COOKIE_NAME = "session_expiry"

export function SessionTimeoutDialog() {
  const { user, resetSessionTimeout, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const checkSessionExpiry = useCallback(() => {
    if (!user) return

    const cookies = parseCookies()
    const expiryTime = cookies[SESSION_COOKIE_NAME]

    if (!expiryTime) return

    const now = Date.now()
    const expiry = new Date(expiryTime).getTime()
    const timeRemaining = expiry - now

    if (timeRemaining <= WARNING_BEFORE_TIMEOUT && timeRemaining > 0) {
      setShowWarning(true)
      setTimeLeft(Math.floor(timeRemaining / 1000))
    } else {
      setShowWarning(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      // Check every 10 seconds
      const interval = setInterval(checkSessionExpiry, 10000)
      // Initial check
      checkSessionExpiry()

      return () => clearInterval(interval)
    }
  }, [user, checkSessionExpiry])

  // Update countdown timer
  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [showWarning, timeLeft])

  const handleContinue = () => {
    resetSessionTimeout()
    setShowWarning(false)
  }

  const handleLogout = () => {
    signOut()
    setShowWarning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!showWarning) return null

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Su sesión está por expirar</DialogTitle>
          <DialogDescription>
            Por razones de seguridad, su sesión expirará en {formatTime(timeLeft)}. ¿Desea continuar con su sesión?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-between sm:justify-between">
          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
          <Button onClick={handleContinue}>Continuar sesión</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
