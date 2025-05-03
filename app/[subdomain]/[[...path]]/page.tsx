import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default function SubdomainCatchAll({
  params,
}: {
  params: { subdomain: string; path?: string[] }
}) {
  const headersList = headers()
  const host = headersList.get("host") || ""
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

  // Verificar si estamos en un subdominio real
  const isSubdomain = host.includes(`.${rootDomain}`) && !host.startsWith("www.")

  // Si no estamos en un subdominio, redirigir a la página principal
  if (!isSubdomain) {
    return redirect("/")
  }

  // Construir la ruta para el tenant
  const path = params.path || []
  const tenantPath = `/tenant/${params.subdomain}${path.length > 0 ? `/${path.join("/")}` : ""}`

  console.log(`Redirecting from subdomain route: ${host}/${path.join("/")} to ${tenantPath}`)

  // Redirigir a la ruta del tenant
  return redirect(tenantPath)
}
