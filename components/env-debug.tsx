"use client"

import { useState } from "react"

export default function EnvDebug() {
  const [showDebug, setShowDebug] = useState(false)

  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  }

  const missingVars = Object.entries(envVars).filter(([_, value]) => !value || value === "undefined")

  return (
    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Depuración de variables de entorno</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              {missingVars.length === 0
                ? "Todas las variables de entorno públicas están configuradas correctamente."
                : `Faltan ${missingVars.length} variables de entorno públicas.`}
            </p>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-2 text-sm font-medium text-blue-800 underline"
            >
              {showDebug ? "Ocultar detalles" : "Mostrar detalles"}
            </button>
            {showDebug && (
              <div className="mt-4">
                <h4 className="font-medium">Estado de las variables de entorno:</h4>
                <ul className="mt-2 list-disc pl-5">
                  {Object.entries(envVars).map(([key, value]) => (
                    <li key={key} className={value ? "text-green-700" : "text-red-700"}>
                      {key}: {value ? "✓ Configurada" : "✗ No configurada"}
                    </li>
                  ))}
                </ul>
                {missingVars.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium">Variables faltantes:</h4>
                    <ul className="mt-2 list-disc pl-5">
                      {missingVars.map(([key]) => (
                        <li key={key}>{key}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
