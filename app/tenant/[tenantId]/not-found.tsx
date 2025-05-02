"use client"

export default function TenantNotFound({ params }: { params: { tenantId: string } }) {
  const tenantId = params?.tenantId || ""

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-medium mb-6">Página no encontrada</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Lo sentimos, la página que estás buscando en el tenant {tenantId} no existe o ha sido movida.
      </p>
      <div className="flex gap-4">
        <a
          href={`/tenant/${tenantId}/dashboard`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Ir al dashboard
        </a>
        <button
          className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
          onClick={() => window.history.back()}
        >
          Volver atrás
        </button>
      </div>
    </div>
  )
}
