"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function ClientOrders({ params }: { params: { tenantId: string } }) {
  const { user, userProfile, loading, signOut } = useAuth()
  const router = useRouter()
  const [loadingData, setLoadingData] = useState(true)

  // Datos de ejemplo para pedidos
  const [orders, setOrders] = useState([
    {
      id: "order-001",
      date: new Date().toLocaleDateString(),
      status: "Entregado",
      total: 25.99,
      items: 3,
    },
    {
      id: "order-002",
      date: new Date(Date.now() - 86400000).toLocaleDateString(), // Ayer
      status: "En proceso",
      total: 18.5,
      items: 2,
    },
  ])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else if (userProfile && userProfile.tenantId !== params.tenantId) {
        router.push(`/tenant/${params.tenantId}/login`)
      } else {
        // Aquí cargaríamos los pedidos reales desde Firestore
        setLoadingData(false)
      }
    }
  }, [loading, user, userProfile, router, params.tenantId])

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user || !userProfile) {
    return null // Se redirigirá en el useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">{params.tenantId} - Mis Pedidos</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userProfile.name || user.email}</span>
            <button onClick={() => signOut()} className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r bg-gray-50">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/client/dashboard`}
                  className="block rounded p-2 hover:bg-gray-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/client/orders`}
                  className="block rounded bg-blue-100 p-2 font-medium text-blue-800"
                >
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href={`/tenant/${params.tenantId}/menu`} className="block rounded p-2 hover:bg-gray-200">
                  Ver Menú
                </Link>
              </li>
              <li>
                <Link
                  href={`/tenant/${params.tenantId}/client/profile`}
                  className="block rounded p-2 hover:bg-gray-200"
                >
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Historial de Pedidos</h2>
              <Link
                href={`/tenant/${params.tenantId}/client/orders/new`}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Nuevo Pedido
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        ID Pedido
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Fecha
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Estado
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-500">{order.date}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              order.status === "Entregado"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm text-gray-900">${order.total.toFixed(2)}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Link
                            href={`/tenant/${params.tenantId}/client/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border bg-white p-6 text-center">
                <p className="text-gray-500">No tienes pedidos todavía.</p>
                <Link
                  href={`/tenant/${params.tenantId}/menu`}
                  className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Ver Menú
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
