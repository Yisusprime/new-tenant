import { type NextRequest, NextResponse } from "next/server"
import { auth, firestore } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password, secretKey } = await request.json()

    // Verificar la clave secreta
    if (secretKey !== process.env.SUPERADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Clave secreta inválida" }, { status: 401 })
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: "Super Admin",
    })

    // Asignar rol de superadmin
    await auth.setCustomUserClaims(userRecord.uid, {
      role: "superadmin",
    })

    // Guardar información del superadmin en Firestore
    await firestore.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      role: "superadmin",
      createdAt: new Date(),
    })

    // Crear un token de sesión para el usuario
    const customToken = await auth.createCustomToken(userRecord.uid)

    return NextResponse.json({
      success: true,
      customToken,
    })
  } catch (error) {
    console.error("Error al registrar superadmin:", error)
    return NextResponse.json({ error: "Error al registrar el superadmin" }, { status: 500 })
  }
}
