import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function NoBranchSelectedAlert() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No hay sucursal seleccionada</AlertTitle>
      <AlertDescription>Por favor, selecciona una sucursal para continuar.</AlertDescription>
    </Alert>
  )
}

// Asegurarnos de que NoBranchSelectedAlert se exporte como una exportación nombrada
