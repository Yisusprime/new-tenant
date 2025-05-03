"use client"

import { useState, useEffect } from "react"
import { app, auth, db } from "@/lib/firebase/client"
import Link from "next/link"

export default function DiagnosticoPage() {
  const [diagnostico, setDiagnostico] = useState<any>({
    loading: true,
    firebase: {
      inicializado: false,
      auth: false,
      firestore: false,
    },
    env: {},
    error: null,
  })

  useEffect(() => {
    async function runDiagnostico() {
      try {
        // Verificar variables de entorno
        const env = {
          apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          rootDomain: !!process.env.NEXT_PUBLIC_ROOT_DOMAIN,
        }

        // Verificar Firebase
        const firebaseCheck = {
          inicializado: !!app && Object.keys(app).length > 0,
          auth: !!auth && Object.keys(auth).length > 0,
          firestore: !!db && Object.keys(db).length > 0,
        }

        // Intentar una operación simple con Firestore
        let firestoreOperacion = false
        try {
          if (db && typeof db.collection === "function") {
            const testCollection = db.collection("_test_")
            firestoreOperacion = true
          }
        } catch (error) {
          console.error("Error al probar operación de Firestore:", error)
        }

        setDiagnostico({
          loading: false,
          firebase: {
            ...firebaseCheck,
            firestoreOperacion,
          },
          env,
          error: null,
        })
      } catch (error) {
        console.error("Error en diagnóstico:", error)
        setDiagnostico({
          loading: false,
          firebase: {},
          env: {},
          error: error instanceof Error ? error.message : "Error desconocido",
        })
      }
    }

    runDiagnostico()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Diagnóstico de Firebase</h1>

          {diagnostico.loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {diagnostico.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p className="font-bold">Error en diagnóstico</p>
                  <p>{diagnostico.error}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-3">Variables de entorno</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Variable</th>
                        <th className="text-left py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(diagnostico.env).map(([key, value]) => (
                        <tr key={key} className="border-t border-gray-200">
                          <td className="py-2">{key}</td>
                          <td className="py-2">
                            {value ? (
                              <span className="text-green-600 font-medium">Definida</span>
                            ) : (
                              <span className="text-red-600 font-medium">No definida</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Firebase</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left py-2">Componente</th>
                        <th className="text-left py-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(diagnostico.firebase).map(([key, value]) => (
                        <tr key={key} className="border-t border-gray-200">
                          <td className="py-2">{key}</td>
                          <td className="py-2">
                            {value ? (
                              <span className="text-green-600 font-medium">OK</span>
                            ) : (
                              <span className="text-red-600 font-medium">Error</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2">Recomendaciones</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {!Object.values(diagnostico.env).every(Boolean) && (
                    <li>
                      Verifica que todas las variables de entorno estén correctamente definidas en tu archivo .env.local
                    </li>
                  )}
                  {!diagnostico.firebase.inicializado && (
                    <li>Firebase no se ha inicializado correctamente. Verifica la configuración.</li>
                  )}
                  {!diagnostico.firebase.auth && (
                    <li>
                      Firebase Auth no está disponible. Verifica que la autenticación esté habilitada en la consola de
                      Firebase.
                    </li>
                  )}
                  {!diagnostico.firebase.firestore && (
                    <li>
                      Firestore no está disponible. Verifica que Firestore esté habilitado en la consola de Firebase.
                    </li>
                  )}
                  {!diagnostico.firebase.firestoreOperacion && (
                    <li>No se pueden realizar operaciones en Firestore. Verifica las reglas de seguridad.</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-center mt-6">
                <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
