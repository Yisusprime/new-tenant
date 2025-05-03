"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

// Función para validar el subdominio
async function validateSubdomain(subdomain: string): Promise<{ valid: boolean; message?: string }> {
  console.log("Validando subdominio:", subdomain)

  try {
    // Validar formato (solo letras, números y guiones)
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return {
        valid: false,
        message: "El subdominio solo puede contener letras minúsculas, números y guiones",
      }
    }

    // Verificar longitud mínima
    if (subdomain.length < 3) {
      return {
        valid: false,
        message: "El subdominio debe tener al menos 3 caracteres",
      }
    }

    // Verificar si el subdominio ya está en uso
    try {
      console.log("Verificando si el subdominio ya existe en Firestore")

      // Verificar que db esté inicializado correctamente
      if (!db) {
        console.error("Firestore no está inicializado correctamente")
        return {
          valid: false,
          message: "Error de configuración: Firestore no está disponible",
        }
      }

      // Intentar acceder directamente al documento del tenant por ID
      const tenantDoc = await getDoc(doc(db, "tenants", subdomain))

      if (tenantDoc.exists()) {
        console.log(`El subdominio '${subdomain}' ya está en uso`)
        return {
          valid: false,
          message: `El subdominio '${subdomain}' ya está en uso. Por favor, elige otro.`,
        }
      }

      console.log(`Subdominio '${subdomain}' disponible`)
      return { valid: true }
    } catch (error) {
      console.error("Error al verificar subdominio en Firestore:", error)
      return {
        valid: false,
        message: `Error al verificar disponibilidad del subdominio: ${error instanceof Error ? error.message : "Error desconocido"}`,
      }
    }
  } catch (error) {
    console.error("Error general al validar subdominio:", error)
    return {
      valid: false,
      message: `Error al validar el subdominio: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para registrar un nuevo tenant
export async function registerTenant(formData: FormData) {
  try {
    console.log("Iniciando registro de tenant")

    // Extraer datos del formulario
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const subdomain = (formData.get("subdomain") as string).toLowerCase()

    console.log("Datos recibidos:", { name, email, subdomain })

    // Validar datos
    if (!name || !email || !password || !confirmPassword || !subdomain) {
      return { success: false, message: "Todos los campos son obligatorios" }
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Las contraseñas no coinciden" }
    }

    // Validar subdominio
    const subdomainValidation = await validateSubdomain(subdomain)
    if (!subdomainValidation.valid) {
      return { success: false, message: subdomainValidation.message }
    }

    // Verificar que Firebase esté configurado correctamente
    if (!auth) {
      console.error("Firebase Auth no está inicializado correctamente")
      return { success: false, message: "Error de configuración: Firebase Auth no está disponible" }
    }

    // Crear usuario en Firebase Authentication
    console.log("Creando usuario en Firebase Auth")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid
    console.log("Usuario creado con UID:", uid)

    // Crear documento del tenant en Firestore
    console.log("Creando documento del tenant en Firestore")
    const tenantRef = doc(db, "tenants", subdomain)
    await setDoc(tenantRef, {
      name,
      subdomain,
      ownerId: uid,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Crear perfil de usuario con rol de admin
    console.log("Creando perfil de usuario")
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      role: "admin",
      tenantId: subdomain,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // Actualizar estadísticas
    console.log("Actualizando estadísticas")
    const statsRef = doc(db, "system", "stats")
    const statsDoc = await getDoc(statsRef)

    if (statsDoc.exists()) {
      await setDoc(
        statsRef,
        {
          totalTenants: (statsDoc.data()?.totalTenants || 0) + 1,
          totalUsers: (statsDoc.data()?.totalUsers || 0) + 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } else {
      await setDoc(statsRef, {
        totalTenants: 1,
        totalUsers: 1,
        totalSuperadmins: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    // Establecer cookie con información del tenant
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
    console.log("Configurando cookies con dominio raíz:", rootDomain)

    cookies().set("current_tenant", subdomain, {
      httpOnly: false, // Accesible desde JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    // Establecer cookie con el ID del usuario para autenticación entre dominios
    cookies().set("tenant_user_id", uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    // Redirigir al dashboard del tenant
    const tenantUrl =
      process.env.NODE_ENV === "production"
        ? `https://${subdomain}.${rootDomain}/admin/dashboard`
        : `http://${subdomain}.localhost:3000/admin/dashboard`

    console.log("Registro exitoso, redirigiendo a:", tenantUrl)
    return { success: true, tenantUrl }
  } catch (error: any) {
    console.error("Error al registrar tenant:", error)
    return {
      success: false,
      message: error.message || "Error al registrar el tenant. Por favor, intenta de nuevo.",
    }
  }
}

// Función para iniciar sesión
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { success: false, message: "Email y contraseña son requeridos" }
    }

    // Iniciar sesión con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    // Obtener perfil del usuario
    const userDoc = await getDoc(doc(db, "users", uid))

    if (!userDoc.exists()) {
      return { success: false, message: "Perfil de usuario no encontrado" }
    }

    const userData = userDoc.data()
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"

    // Establecer cookies para autenticación entre dominios
    cookies().set("tenant_user_id", uid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    if (userData.tenantId) {
      cookies().set("current_tenant", userData.tenantId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 días
      })

      // Determinar URL de redirección basada en el rol
      let redirectUrl = "/"

      if (userData.role === "admin") {
        redirectUrl =
          process.env.NODE_ENV === "production"
            ? `https://${userData.tenantId}.${rootDomain}/admin/dashboard`
            : `http://${userData.tenantId}.localhost:3000/admin/dashboard`
      } else if (userData.role === "superadmin") {
        redirectUrl = "/superadmin/dashboard"
      }

      return { success: true, redirectUrl }
    }

    return { success: true, redirectUrl: "/" }
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error)
    return {
      success: false,
      message: error.message || "Error al iniciar sesión. Verifica tus credenciales.",
    }
  }
}

// Función para cerrar sesión
export async function signOutUser(options?: { domain: "root" | "tenant" }) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "gastroo.online"
  const domainSetting = process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined

  // Eliminar cookies de autenticación
  cookies().set("tenant_user_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: domainSetting,
    path: "/",
    maxAge: 0, // Expirar inmediatamente
  })

  // Redirigir según el contexto
  if (options?.domain === "tenant") {
    const currentTenant = cookies().get("current_tenant")?.value

    if (currentTenant) {
      redirect(`/${currentTenant}`)
    } else {
      redirect("/")
    }
  } else {
    redirect("/login")
  }
}
