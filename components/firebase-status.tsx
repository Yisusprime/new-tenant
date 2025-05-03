"use client"

import { useEffect, useState } from "react"
import { app } from "@/lib/firebase/client"

export default function FirebaseStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([])

  useEffect(() => {
    try {
      // Verificar las variables de entorno requeridas
      const requiredEnvVars = [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]

      const missing = requiredEnvVars.filter((envVar) => !process.env[envVar] || process.env[envVar] === "undefined")
      setMissingEnvVars(missing)

      if (missing.length > 0) {
        setStatus("error")
        setMessage(`Faltan variables de entorno: ${missing.join(", ")}`)
        return
      }

      const config = app?.options
      if (config?.apiKey && config?.projectId) {
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
              <>
                <p className="mt-2">
                  Verifica que las variables de entorno estén configuradas correctamente en tu archivo .env.local o en
                  tu plataforma de despliegue.
                </p>
                {missingEnvVars.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Variables de entorno faltantes:</p>
                    <ul className="mt-1 list-disc pl-5">
                      {missingEnvVars.map((envVar) => (
                        <li key={envVar}>{envVar}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 rounded-md bg-yellow-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Instrucciones para configurar Firebase</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>1. Crea un archivo .env.local en la raíz de tu proyecto con las siguientes variables:</p>
                        <pre className="mt-1 overflow-x-auto rounded-md bg-gray-800 p-2 text-xs text-white">
                          {`NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_client_email
FIREBASE_PRIVATE_KEY="tu_private_key"

NEXT_PUBLIC_ROOT_DOMAIN=gastroo.online
SUPERADMIN_SECRET_KEY=tu_secret_key`}
                        </pre>
                        <p className="mt-2">
                          2. Si estás desplegando en Vercel, añade estas variables en la sección de Environment
                          Variables de tu proyecto.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
