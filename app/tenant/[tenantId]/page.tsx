import Link from "next/link"

export default function TenantHomePage({ params }: { params: { tenantId: string } }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-6 text-4xl font-bold">Tenant: {params.tenantId}</h1>

      <div className="mb-8 w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Enlaces de prueba</h2>
        <ul className="space-y-2">
          <li>
            <Link href={`/tenant/${params.tenantId}/login`} className="text-blue-600 hover:underline">
              Página de login
            </Link>
          </li>
          <li>
            <Link href={`/tenant/${params.tenantId}/dashboard`} className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href={`/tenant/${params.tenantId}/admin/dashboard`} className="text-blue-600 hover:underline">
              Admin Dashboard
            </Link>
          </li>
        </ul>
      </div>

      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Información del tenant</h2>
        <p>
          <strong>ID del tenant:</strong> {params.tenantId}
        </p>
        <p>
          <strong>URL actual:</strong> {typeof window !== "undefined" ? window.location.href : ""}
        </p>
      </div>
    </div>
  )
}
