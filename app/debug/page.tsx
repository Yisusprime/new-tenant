"use client"

import { useEffect, useState } from "react"
import { SUBDOMAIN_CONFIG } from "@/lib/subdomain-config"

export default function DebugPage() {
  const [hostname, setHostname] = useState("")
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [isSubdomain, setIsSubdomain] = useState(false)
  const [rootDomain, setRootDomain] = useState("")
  const [currentPath, setCurrentPath] = useState("")

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      const host = window.location.hostname
      setHostname(host)
      setSubdomain(SUBDOMAIN_CONFIG.getSubdomain(host))
      setIsSubdomain(SUBDOMAIN_CONFIG.isSubdomain(host))
      setRootDomain(SUBDOMAIN_CONFIG.rootDomain)
      setCurrentPath(window.location.pathname)
    }
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Página de Diagnóstico</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información de Dominio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Hostname:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{hostname}</p>
          </div>
          <div>
            <p className="text-gray-600">¿Es subdominio?</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{isSubdomain ? "Sí" : "No"}</p>
          </div>
          <div>
            <p className="text-gray-600">Subdominio detectado:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{subdomain || "Ninguno"}</p>
          </div>
          <div>
            <p className="text-gray-600">Dominio raíz configurado:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{rootDomain}</p>
          </div>
          <div>
            <p className="text-gray-600">Ruta actual:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{currentPath}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Rutas de Prueba</h2>
        <div className="space-y-4">
          {subdomain ? (
            <>
              <div>
                <p className="text-gray-600">Rutas para el subdominio {subdomain}:</p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    <a href="/" className="text-blue-600 hover:underline">
                      Inicio ({subdomain}.{rootDomain}/)
                    </a>
                  </li>
                  <li>
                    <a href="/login" className="text-blue-600 hover:underline">
                      Login ({subdomain}.{rootDomain}/login)
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard" className="text-blue-600 hover:underline">
                      Dashboard ({subdomain}.{rootDomain}/dashboard)
                    </a>
                  </li>
                  <li>
                    <a href="/admin/dashboard" className="text-blue-600 hover:underline">
                      Admin Dashboard ({subdomain}.{rootDomain}/admin/dashboard)
                    </a>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p>No estás en un subdominio. Visita un subdominio para ver las rutas de prueba.</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Variables de Entorno</h2>
        <div>
          <p className="text-gray-600">NEXT_PUBLIC_ROOT_DOMAIN:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{process.env.NEXT_PUBLIC_ROOT_DOMAIN || "No definido"}</p>
        </div>
      </div>
    </div>
  )
}
