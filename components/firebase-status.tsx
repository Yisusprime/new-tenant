"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { onSnapshot, collection } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function FirebaseStatus() {
  const [authStatus, setAuthStatus] = useState<"loading" | "connected" | "error">("loading")
  const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Verificar estado de autenticación
    const unsubAuth = onAuthStateChanged(
      auth,
      () => {
        setAuthStatus("connected")
      },
      (error) => {
        console.error("Firebase Auth error:", error)
        setAuthStatus("error")
        setErrorMessage(`Auth error: ${error.message}`)
      },
    )

    // Verificar estado de Firestore
    let unsubDb: (() => void) | undefined

    try {
      // Intentar una consulta simple para verificar la conexión
      unsubDb = onSnapshot(
        collection(db, "system"),
        () => {
          setDbStatus("connected")
        },
        (error) => {
          console.error("Firestore error:", error)
          setDbStatus("error")
          setErrorMessage(`Firestore error: ${error.message}`)
        },
      )
    } catch (error: any) {
      console.error("Error setting up Firestore listener:", error)
      setDbStatus("error")
      setErrorMessage(`Firestore setup error: ${error.message}`)
    }

    return () => {
      unsubAuth()
      if (unsubDb) unsubDb()
    }
  }, [])

  if (authStatus === "error" || dbStatus === "error") {
    return (
      <Alert variant="destructive" className="mb-4 mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Firebase</AlertTitle>
        <AlertDescription>{errorMessage || "No se pudo conectar con Firebase"}</AlertDescription>
      </Alert>
    )
  }

  if (authStatus === "loading" || dbStatus === "loading") {
    return (
      <Alert className="mb-4 mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Conectando con Firebase</AlertTitle>
        <AlertDescription>Verificando conexión...</AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 bg-green-50 mx-auto">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Firebase</AlertTitle>
      <AlertDescription className="text-green-700">
        La conexión con Firebase está funcionando correctamente
      </AlertDescription>
    </Alert>
  )
}
