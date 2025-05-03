import { type NextRequest, NextResponse } from "next/server"
import { auth, firestore } from "@/lib/firebase/admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantName, restaurantName } = await request.json()

    // Validar que el nombre del tenant sea válido (solo alfanuméricos y guiones)
    if (!/^[a-z0-9-]+$/.test(tenantName)) {
      return NextResponse.json(
        { error: "El nombre del tenant solo puede contener letras minúsculas, números y guiones" },
        { status: 400 },
      )
    }

    // Verificar si el tenant ya existe
    const tenantDoc = await firestore.collection("tenants").doc(tenantName).get()
    if (tenantDoc.exists) {
      return NextResponse.json({ error: "Este nombre de tenant ya está en uso" }, { status: 400 })
    }

    // Crear usuario en Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: restaurantName,
    })

    // Asignar rol de admin
    await auth.setCustomUserClaims(userRecord.uid, {
      role: "admin",
      tenantId: tenantName,
    })

    // Guardar información del tenant en Firestore
    await firestore.collection("tenants").doc(tenantName).set({
      name: restaurantName,
      createdAt: new Date(),
      ownerId: userRecord.uid,
      active: true,
    })

    // Crear un token de sesión para el usuario
    const customToken = await auth.createCustomToken(userRecord.uid)

    return NextResponse.json({
      success: true,
      tenantId: tenantName,
      customToken,
    })
  } catch (error) {
    console.error("Error al registrar tenant:", error)
    return NextResponse.json({ error: "Error al registrar el tenant" }, { status: 500 })
  }
}
