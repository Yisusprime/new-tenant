import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Eliminar la cookie de sesión
    cookies().set({
      name: "session",
      value: "",
      maxAge: 0,
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".gastroo.online" : "localhost",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al cerrar la sesión:", error)
    return NextResponse.json({ error: "Error al cerrar la sesión" }, { status: 500 })
  }
}
