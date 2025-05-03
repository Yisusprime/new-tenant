import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/firebase/admin"
import { isFirebaseAdminInitialized } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    // Verificar si Firebase Admin está inicializado
    if (!isFirebaseAdminInitialized() || !auth) {
      return NextResponse.json(
        { error: "El servidor no está configurado correctamente. Firebase Admin no está inicializado." },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
    }

    try {
      // Crear una cookie de sesión que dure 2 semanas
      const expiresIn = 60 * 60 * 24 * 14 * 1000 // 2 semanas en milisegundos
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

      // Configurar la cookie para que sea accesible en todos los subdominios
      cookies().set({
        name: "session",
        value: sessionCookie,
        maxAge: expiresIn / 1000, // maxAge espera segundos, no milisegundos
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        domain: process.env.NODE_ENV === "production" ? ".gastroo.online" : "localhost",
        sameSite: "lax",
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error al crear la cookie de sesión:", error)
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
