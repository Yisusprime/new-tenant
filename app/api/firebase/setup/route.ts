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

export async function GET(request: Request) {
  try {
    // Verificar si la solicitud viene de un administrador
    // En producción, deberías implementar una autenticación adecuada
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getFirebaseAdmin().firestore()

    // Verificar si existe la colección system
    const systemRef = db.collection("system")
    const statsDoc = await systemRef.doc("stats").get()

    if (!statsDoc.exists) {
      // Crear documento de estadísticas si no existe
      await systemRef.doc("stats").set({
        userCount: 0,
        tenantCount: 0,
        lastUpdated: new Date().toISOString(),
      })
    }

    // Verificar si existen las colecciones necesarias
    const collections = ["users", "tenants", "domains"]
    const collectionStatus = {}

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get()
      collectionStatus[collectionName] = !snapshot.empty
    }

    return NextResponse.json({
      status: "success",
      message: "Firebase setup checked",
      systemStats: statsDoc.exists ? statsDoc.data() : "Created",
      collections: collectionStatus,
    })
  } catch (error) {
    console.error("Error in Firebase setup API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
