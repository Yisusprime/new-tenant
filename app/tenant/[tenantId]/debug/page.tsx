"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function TenantDebugPage({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading } = useAuth()
  const [hostname, setHostname] = useState("")
  const [pathname, setPathname] = useState("")
  const [href, setHref] = useState("")
  const [userAgent, setUserAgent] = useState("")
  const [cookies, setCookies] = useState("")
  const [tenantData, setTenantData] = useState<any>(null)
  const [loadingTenant, setLoadingTenant] = useState(true)
  const [redirectHistory, setRedirectHistory] = useState<string[]>([])

  useEffect(() => {
    setHostname(window.location.hostname)
    setPathname(window.location.pathname)
    setHref(window.location.href)
    setUserAgent(navigator.userAgent)
    setCookies(document.cookie)

    // Obtener historial de redirecciones del sessionStorage
    const history = sessionStorage.getItem("redirectHistory")
    if (history) {
      setRedirectHistory(JSON.parse(history))
    }

    // Añadir la URL actual al historial
    const currentUrl = window.location.href
    const updatedHistory = history ? [...JSON.parse(history), currentUrl] : [currentUrl]
    sessionStorage.setItem("redirectHistory", JSON.stringify(updatedHistory))

    // Cargar datos del tenant
    async function loadTenantData() {
      try {
        const tenantDoc = await getDoc(doc(db, "tenants", params.tenantId))
        if (tenantDoc.exists()) {
          setTenantData({
            id: tenantDoc.id,
            ...tenantDoc.data(),
          })
        }
      } catch (error) {
        console.error("Error al cargar datos del tenant:", error)
      } finally {
        setLoadingTenant(false)
      }
    }

    loadTenantData()
  }, [params.tenantId])

  // Función para limpiar el historial de redirecciones
  const clearRedirectHistory = () => {
    sessionStorage.removeItem("redirectHistory")
    setRedirectHistory([])
  }

  // Función para limpiar el intento de redirección
  const clearRedirectAttempt = () => {
    sessionStorage.removeItem("redirectAttempt")
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">Página de Diagnóstico - Tenant: {params.tenantId}</h1>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Estado de Autenticación</h2>
        <div className="space-y-2">
          <p>
            <strong>Estado de carga:</strong> {loading ? "Cargando..." : "Completado"}
          </p>
          <p>
            <strong>Usuario autenticado:</strong> {user ? "Sí" : "No"}
          </p>
          {user && (
            <>
              <p>
                <strong>UID:</strong> {user.uid}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </>
          )}
          <p>
            <strong>Perfil cargado:</strong> {userProfile ? "Sí" : "No"}
          </p>
          {userProfile && (
            <>
              <p>
                <strong>Nombre:</strong> {userProfile.name || "No definido"}
              </p>
              <p>
                <strong>Rol:</strong>{" "}
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    userProfile.role === "admin"
                      ? "bg-green-100 text-green-800"
                      : userProfile.role === "client"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {userProfile.role || "No definido"}
                </span>
              </p>
              <p>
                <strong>Tenant ID:</strong> {userProfile.tenantId || "No definido"}
              </p>
              <p>
                <strong>Subdominio:</strong> {userProfile.subdomain || "No definido"}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Información del Tenant</h2>
        {loadingTenant ? (
          <p>Cargando datos del tenant...</p>
        ) : tenantData ? (
          <div className="space-y-2">
            <p>
              <strong>ID:</strong> {tenantData.id}
            </p>
            <p>
              <strong>Nombre:</strong> {tenantData.name || "No definido"}
            </p>
            <p>
              <strong>Subdominio:</strong> {tenantData.subdomain || "No definido"}
            </p>
            <p>
              <strong>Propietario:</strong> {tenantData.ownerId || "No definido"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  tenantData.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {tenantData.status || "No definido"}
              </span>
            </p>
          </div>
        ) : (
          <p>No se encontraron datos del tenant</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Información de la URL</h2>
        <div className="space-y-2">
          <p>
            <strong>Hostname:</strong> {hostname}
          </p>
          <p>
            <strong>Pathname:</strong> {pathname}
          </p>
          <p>
            <strong>URL completa:</strong> {href}
          </p>
          <p>
            <strong>Tenant ID:</strong> {params.tenantId}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Historial de Redirecciones</h2>
        {redirectHistory.length > 0 ? (
          <>
            <ul className="mb-4 list-inside list-disc space-y-1">
              {redirectHistory.map((url, index) => (
                <li key={index} className="text-sm">
                  {url}
                </li>
              ))}
            </ul>
            <div className="flex space-x-2">
              <button
                onClick={clearRedirectHistory}
                className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
              >
                Limpiar historial
              </button>
              <button
                onClick={clearRedirectAttempt}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
              >
                Limpiar intento de redirección
              </button>
            </div>
          </>
        ) : (
          <p>No hay historial de redirecciones</p>
        )}
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Información del navegador</h2>
        <div className="space-y-2">
          <p>
            <strong>User Agent:</strong> {userAgent}
          </p>
          <p>
            <strong>Cookies:</strong> {cookies || "No hay cookies"}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Variables de Entorno</h2>
        <p>
          <strong>NEXT_PUBLIC_ROOT_DOMAIN:</strong> {process.env.NEXT_PUBLIC_ROOT_DOMAIN || "No definido"}
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Enlaces de prueba</h2>
        <ul className="space-y-2">
          <li>
            <a href={`/tenant/${params.tenantId}`} className="text-blue-600 hover:underline">
              Inicio
            </a>
          </li>
          <li>
            <a href={`/tenant/${params.tenantId}/login`} className="text-blue-600 hover:underline">
              Login
            </a>
          </li>
          <li>
            <a href={`/tenant/${params.tenantId}/client/dashboard`} className="text-blue-600 hover:underline">
              Dashboard de Cliente
            </a>
          </li>
          <li>
            <a href={`/tenant/${params.tenantId}/admin/dashboard`} className="text-blue-600 hover:underline">
              Admin Dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
