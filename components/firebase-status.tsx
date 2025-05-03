"use client"

import { useEffect, useState } from "react"
import { app } from "@/lib/firebase/client"

export default function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    try {
      const config = app.options
      if (config.apiKey && config.projectId) {
        setStatus("success")
        setMessage(`Firebase conectado correctamente al proyecto: ${config.projectId}`)
      } else {
        setStatus("error")
        setMessage("Configuración de Firebase incompleta")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "Error al verificar Firebase")
    }
  }, [])

  return (
    <div
      className={`mt-4 rounded-md p-4 ${
        status === "success" ? "bg-green-50" : status === "error" ? "bg-red-50" : "bg-gray-50"
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {status === "loading" && (
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {status === "success" && (
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          {status === "error" && (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          )}
        </div>
        <div className="ml-3">
          <h3
            className={`text-sm font-medium ${
              status === "success" ? "text-green-800" : status === "error" ? "text-red-800" : "text-gray-800"
            }`}
          >
            Estado de Firebase
          </h3>
          <div
            className={`mt-2 text-sm ${
              status === "success" ? "text-green-700" : status === "error" ? "text-red-700" : "text-gray-700"
            }`}
          >
            <p>{message}</p>
            {status === "error" && (
              <p className="mt-2">
                Verifica que las variables de entorno estén configuradas correctamente en tu archivo .env.local o en tu
                plataforma de despliegue.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
