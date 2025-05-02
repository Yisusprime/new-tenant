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
    const hostname = searchParams.get("hostname")

    if (!hostname) {
      return NextResponse.json({ error: "Hostname is required" }, { status: 400 })
    }

    // Default domain info
    const domainInfo = {
      domain: hostname,
      tenantId: null,
      isCustomDomain: false,
      isSubdomain: false,
    }

    // Para desarrollo local
    if (hostname.includes("localhost")) {
      // Verificar si es un formato de subdominio como tenant-name.localhost:3000
      const subdomainMatch = hostname.match(/^([^.]+)\.localhost/)
      if (subdomainMatch) {
        const subdomain = subdomainMatch[1]
        if (subdomain !== "www" && subdomain !== "app") {
          domainInfo.isSubdomain = true
          domainInfo.tenantId = subdomain
        }
      }
      return NextResponse.json(domainInfo)
    }

    // Obtener el dominio raíz (ej., gastroo.online)
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Verificar si es un subdominio del dominio raíz
    if (hostname.endsWith(`.${rootDomain}`)) {
      const subdomain = hostname.replace(`.${rootDomain}`, "")
      if (subdomain !== "www" && subdomain !== "app") {
        domainInfo.isSubdomain = true
        domainInfo.tenantId = subdomain
      }
      return NextResponse.json(domainInfo)
    }

    // Verificar si es un dominio personalizado consultando Firestore
    try {
      const db = getFirebaseAdmin().firestore()
      const domainsRef = db.collection("domains")
      const querySnapshot = await domainsRef.where("domain", "==", hostname).get()

      if (!querySnapshot.empty) {
        const domainDoc = querySnapshot.docs[0]
        domainInfo.isCustomDomain = true
        domainInfo.tenantId = domainDoc.data().tenantId
      }
    } catch (error) {
      console.error("Error checking custom domain:", error)
    }

    return NextResponse.json(domainInfo)
  } catch (error) {
    console.error("Error in domains API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
