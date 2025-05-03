"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que el siguiente renderizado muestre la UI alternativa
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("Error capturado por ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI alternativa
      return (
        this.props.fallback || (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-md text-center">
              <h2 className="mb-4 text-2xl font-semibold text-red-600">Algo salió mal</h2>
              <p className="mb-4 text-gray-700">
                Ha ocurrido un error al cargar esta página. Por favor, intenta recargar.
              </p>
              <pre className="mb-4 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-left text-xs text-gray-800">
                {this.state.error?.toString()}
              </pre>
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Recargar página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
