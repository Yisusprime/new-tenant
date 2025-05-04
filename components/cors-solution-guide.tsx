"use client"

export function CORSSolutionGuide() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Solución al error CORS</h3>
        <p className="text-amber-700">
          Para resolver este error, necesitas configurar las reglas CORS en Firebase Storage siguiendo estos pasos:
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Paso 1: Instalar Firebase CLI</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
          <pre>npm install -g firebase-tools</pre>
        </div>

        <h4 className="font-medium">Paso 2: Iniciar sesión en Firebase</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
          <pre>firebase login</pre>
        </div>

        <h4 className="font-medium">Paso 3: Crear un archivo cors.json</h4>
        <p className="text-sm text-gray-600">Crea un archivo llamado cors.json con el siguiente contenido:</p>
        <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
          <pre>{`[
  {
    "origin": ["https://*.gastroo.online", "http://localhost:3000"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600
  }
]`}</pre>
        </div>
        <p className="text-sm text-gray-600">
          Esto permitirá solicitudes desde cualquier subdominio de gastroo.online y desde localhost:3000 durante el
          desarrollo.
        </p>

        <h4 className="font-medium">Paso 4: Aplicar la configuración CORS</h4>
        <div className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
          <pre>firebase storage:cors update --project=multi-cliente cors.json</pre>
        </div>
        <p className="text-sm text-gray-600">Reemplaza "multi-cliente" con el ID de tu proyecto de Firebase.</p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Solución alternativa</h3>
        <p className="text-blue-700 mb-2">
          Si no puedes configurar CORS por alguna razón, puedes implementar una solución alternativa usando Cloud
          Functions:
        </p>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Crear una Cloud Function que actúe como proxy para subir archivos</li>
          <li>Enviar el archivo a tu función en lugar de directamente a Storage</li>
          <li>La función subirá el archivo a Storage y devolverá la URL</li>
        </ol>
      </div>
    </div>
  )
}
