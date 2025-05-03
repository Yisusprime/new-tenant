"use client"

import { useEffect, useState } from "react"

export default function TenantDebugPage({ params }: { params: { tenantId: string } }) {
  const [hostname, setHostname] = useState("")
  const [pathname, setPathname] = useState("")
  const [href, setHref] = useState("")
  const [userAgent, setUserAgent] = useState("")
  const [cookies, setCookies] = useState("")

  useEffect(() => {
    setHostname(window.location.hostname)
    setPathname(window.location.pathname)
    setHref(window.location.href)
    setUserAgent(navigator.userAgent)
    setCookies(document.cookie)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">Página de Diagnóstico - Tenant: {params.tenantId}</h1>

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
        <h2 className="mb-4 text-xl font-semibold">Enlaces de prueba</h2>
        <ul className="space-y-2">
          <li>
            <a href="/" className="text-blue-600 hover:underline">
              Inicio
            </a>
          </li>
          <li>
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </li>
          <li>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/admin/dashboard" className="text-blue-600 hover:underline">
              Admin Dashboard
            </a>
          </li>
        </ul>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Variables de Entorno</h2>
        <p>
          <strong>NEXT_PUBLIC_ROOT_DOMAIN:</strong> {process.env.NEXT_PUBLIC_ROOT_DOMAIN || "No definido"}
        </p>
      </div>
    </div>
  )
}
