"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TenantDomainTester() {
  const [subdomain, setSubdomain] = useState("")
  const [rootDomain, setRootDomain] = useState("")
  const [fullDomain, setFullDomain] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    // Obtener el dominio raíz de las variables de entorno o del hostname actual
    const hostname = window.location.hostname
    let domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ""

    // Si no hay variable de entorno, intentar extraer del hostname
    if (!domain) {
      // Extraer el dominio raíz del hostname (eliminar subdominios)
      const parts = hostname.split(".")
      if (parts.length >= 2) {
        domain = parts.slice(-2).join(".")
      } else {
        domain = hostname
      }
    }

    setRootDomain(domain)
  }, [])

  useEffect(() => {
    if (subdomain && rootDomain) {
      setFullDomain(`${subdomain}.${rootDomain}`)
    } else {
      setFullDomain("")
    }
  }, [subdomain, rootDomain])

  const handleTest = async () => {
    if (!fullDomain) {
      setMessage({ type: "error", text: "Por favor, ingresa un subdominio" })
      return
    }

    setMessage({ type: "info", text: "Probando conexión..." })

    try {
      // Intentar hacer una solicitud al subdominio
      const response = await fetch(`https://${fullDomain}`, {
        method: "HEAD",
        mode: "no-cors", // Esto permite solicitudes a otros dominios sin CORS
      })

      // Debido a no-cors, no podemos verificar el estado de la respuesta
      // Asumimos que si no hay error, la conexión fue exitosa
      setMessage({ type: "success", text: `Conexión exitosa a ${fullDomain}` })
    } catch (error) {
      console.error("Error al probar el dominio:", error)
      setMessage({ type: "error", text: `Error al conectar con ${fullDomain}. Verifica la configuración DNS.` })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Probar Subdominio</CardTitle>
        <CardDescription>Verifica si tu configuración de subdominio comodín funciona correctamente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subdomain" className="text-sm font-medium">
              Subdominio
            </label>
            <div className="flex items-center">
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="tenant1"
                className="rounded-r-none"
              />
              <div className="bg-muted px-3 py-2 border border-l-0 border-input rounded-r-md">.{rootDomain}</div>
            </div>
          </div>

          {message.text && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleTest} className="w-full">
          Probar Conexión
        </Button>
      </CardFooter>
    </Card>
  )
}
