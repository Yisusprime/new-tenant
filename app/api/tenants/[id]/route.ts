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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    const db = getFirebaseAdmin().firestore()
    const tenantDoc = await db.collection("tenants").doc(tenantId).get()

    if (!tenantDoc.exists) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    return NextResponse.json(tenantDoc.data())
  } catch (error) {
    console.error("Error in tenants API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
