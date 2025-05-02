"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DomainInfo() {
  const [hostname, setHostname] = useState<string>("")
  const [isVercel, setIsVercel] = useState<boolean>(false)
  const [isSubdomain, setIsSubdomain] = useState<boolean>(false)
  const [tenant, setTenant] = useState<string | null>(null)

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const host = window.location.hostname
    setHostname(host)

    // Verificar si es un dominio de Vercel
    const isVercelDomain = host.endsWith(".vercel.app")
    setIsVercel(isVercelDomain)

    // Verificar si es un subdominio
    if (isVercelDomain && host.includes("--")) {
      const [tenantName] = host.split("--")
      setIsSubdomain(true)
      setTenant(tenantName)
    } else if (host.includes(".") && !host.endsWith(".vercel.app") && !host.includes("localhost")) {
      const parts = host.split(".")
      if (parts.length > 2) {
        setIsSubdomain(true)
        setTenant(parts[0])
      }
    } else if (host.includes("localhost") && host.split(".").length > 1) {
      const [tenantName] = host.split(".")
      setIsSubdomain(true)
      setTenant(tenantName)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Dominio</CardTitle>
        <CardDescription>Detalles sobre el dominio actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Hostname:</strong> {hostname}
          </p>
          <p>
            <strong>Es dominio de Vercel:</strong> {isVercel ? "Sí" : "No"}
          </p>
          <p>
            <strong>Es subdominio:</strong> {isSubdomain ? "Sí" : "No"}
          </p>
          {tenant && (
            <p>
              <strong>Tenant:</strong> {tenant}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
