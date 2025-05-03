"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
            <h2 className="text-2xl font-semibold mb-4">Algo salió mal</h2>
            <p className="text-gray-600 mb-6">Lo sentimos, ha ocurrido un error inesperado.</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
