import { NextResponse } from "next/server"
import * as admin from "firebase-admin"

// Inicializar Firebase Admin
let firebaseAdmin: admin.app.App

function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    const serviceAccount = {
      projectId: "multi-cliente",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }

    if (admin.apps.length === 0) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: "https://multi-cliente-default-rtdb.firebaseio.com",
      })
    } else {
      firebaseAdmin = admin.app()
    }
  }
  return firebaseAdmin
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split("Bearer ")[1]
    let decodedToken
    try {
      decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token)
    } catch (error) {
      console.error("Error verifying token:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userId = decodedToken.uid
    const { isFirstUser, isMainDomain } = await request.json()

    const db = getFirebaseAdmin().firestore()

    // Verificar si es el primer usuario
    const statsRef = db.collection("system").doc("stats")
    const statsDoc = await statsRef.get()

    let userCount = 0
    let isActuallyFirstUser = false

    if (statsDoc.exists) {
      userCount = statsDoc.data()?.userCount || 0
      isActuallyFirstUser = userCount === 0
    } else {
      isActuallyFirstUser = true
    }

    // Actualizar estadísticas
    await statsRef.set(
      {
        userCount: userCount + 1,
        lastRegistration: new Date().toISOString(),
      },
      { merge: true },
    )

    // Determinar el rol apropiado
    let role = "user"

    if (isActuallyFirstUser) {
      // Si es el primer usuario, asignarle rol de superadmin
      role = "superadmin"
    } else if (isMainDomain) {
      // Si no es el primer usuario pero está en el dominio principal, asignarle rol de admin
      role = "admin"
    }

    // Actualizar el rol del usuario
    await db.collection("users").doc(userId).update({
      role: role,
    })

    return NextResponse.json({
      success: true,
      isFirstUser: isActuallyFirstUser,
      role: role,
    })
  } catch (error) {
    console.error("Error in register-user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
