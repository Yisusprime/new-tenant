"use server"

import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase-config"

// Acción para verificar la clave secreta y registrar un superadmin
export async function registerSuperAdmin(formData: {
  name: string
  email: string
  password: string
  secretKey: string
}) {
  try {
    // Verificar la clave secreta en el servidor
    if (formData.secretKey !== process.env.SUPERADMIN_SECRET_KEY) {
      return {
        success: false,
        message: "La clave secreta es incorrecta.",
      }
    }

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
    const user = userCredential.user

    // Crear documento de superadmin en Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: formData.name,
      email: formData.email,
      role: "superadmin",
      createdAt: serverTimestamp(),
    })

    return {
      success: true,
      message: "Tu cuenta de superadmin ha sido creada correctamente.",
    }
  } catch (error: any) {
    console.error("Error al registrar:", error)
    return {
      success: false,
      message: error.message || "Ocurrió un error durante el registro.",
    }
  }
}

// Acción para crear un nuevo tenant
export async function createTenant(formData: {
  name: string
  tenant: string
  ownerEmail: string
  ownerName: string
  userId: string
}) {
  try {
    // Verificar si el subdominio está disponible
    const tenantRef = doc(db, "tenants", formData.tenant)
    const tenantSnap = await getDoc(tenantRef)

    if (tenantSnap.exists()) {
      return {
        success: false,
        message: "El subdominio ya está en uso. Por favor, elige otro.",
      }
    }

    // Crear documento de tenant en Firestore
    await setDoc(tenantRef, {
      name: formData.name,
      domain: `${formData.tenant}.gastroo.online`,
      ownerEmail: formData.ownerEmail,
      ownerName: formData.ownerName,
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: formData.userId,
    })

    return {
      success: true,
      message: `El tenant ${formData.name} ha sido creado correctamente.`,
    }
  } catch (error: any) {
    console.error("Error al crear tenant:", error)
    return {
      success: false,
      message: error.message || "Ocurrió un error al crear el tenant.",
    }
  }
}
