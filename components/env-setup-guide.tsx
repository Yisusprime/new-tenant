"use client"

import { useState } from "react"

export default function EnvSetupGuide() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
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
          <h3 className="text-sm font-medium text-yellow-800">Configuración de Firebase</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Para que la aplicación funcione correctamente, necesitas configurar las variables de entorno de Firebase.
            </p>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="mt-2 text-sm font-medium text-yellow-800 underline"
            >
              {showGuide ? "Ocultar guía" : "Mostrar guía de configuración"}
            </button>
            {showGuide && (
              <div className="mt-4">
                <h4 className="font-medium">Pasos para configurar Firebase:</h4>
                <ol className="mt-2 list-decimal pl-5">
                  <li className="mb-2">
                    Crea un proyecto en{" "}
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Firebase Console
                    </a>
                  </li>
                  <li className="mb-2">Añade una aplicación web a tu proyecto y copia la configuración de Firebase</li>
                  <li className="mb-2">
                    Crea un archivo <code className="rounded bg-gray-200 px-1 py-0.5">.env.local</code> en la raíz de tu
                    proyecto con las siguientes variables:
                  </li>
                </ol>
                <pre className="mt-2 overflow-x-auto rounded-md bg-gray-800 p-3 text-xs text-white">
                  {`# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nXXXXX\\n-----END PRIVATE KEY-----\\n"

# Domain
NEXT_PUBLIC_ROOT_DOMAIN=gastroo.online

# Superadmin
SUPERADMIN_SECRET_KEY=tu_clave_secreta_para_superadmin`}
                </pre>
                <h4 className="mt-4 font-medium">Para obtener las credenciales de Firebase Admin:</h4>
                <ol className="mt-2 list-decimal pl-5">
                  <li className="mb-2">
                    Ve a la configuración del proyecto en Firebase Console (⚙️ &gt; Configuración del proyecto)
                  </li>
                  <li className="mb-2">
                    Ve a la pestaña "Cuentas de servicio" y haz clic en "Generar nueva clave privada"
                  </li>
                  <li className="mb-2">
                    Descarga el archivo JSON y usa los valores para las variables de entorno de Firebase Admin
                  </li>
                </ol>
                <h4 className="mt-4 font-medium">Si estás desplegando en Vercel:</h4>
                <ol className="mt-2 list-decimal pl-5">
                  <li className="mb-2">
                    Ve a la configuración de tu proyecto en Vercel (Settings &gt; Environment Variables)
                  </li>
                  <li className="mb-2">Añade todas las variables de entorno mencionadas anteriormente</li>
                  <li className="mb-2">
                    Para FIREBASE_PRIVATE_KEY, asegúrate de incluir las comillas y los saltos de línea (\n)
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
