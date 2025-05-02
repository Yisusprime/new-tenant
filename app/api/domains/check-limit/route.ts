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
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    const plan = searchParams.get("plan")

    if (!tenantId || !plan) {
      return NextResponse.json({ error: "Tenant ID and plan are required" }, { status: 400 })
    }

    // Implementar lógica para verificar si el tenant ha alcanzado su límite de dominios
    // según su plan
    const planLimits: Record<string, number> = {
      free: 0,
      basic: 1,
      pro: 3,
      enterprise: 10,
    }

    const customDomains = planLimits[plan] || 0

    // Contar dominios actuales del tenant
    const db = getFirebaseAdmin().firestore()
    const domainsRef = db.collection("domains")
    const querySnapshot = await domainsRef.where("tenantId", "==", tenantId).get()

    const currentDomainCount = querySnapshot.size

    return NextResponse.json({
      canAddDomain: currentDomainCount < customDomains,
      currentCount: currentDomainCount,
      limit: customDomains,
    })
  } catch (error) {
    console.error("Error in check-limit API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
