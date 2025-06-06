import { db } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"

// Actualizar la interfaz RestaurantBasicInfo para incluir bannerImage, currencyCode y taxRate
export interface RestaurantBasicInfo {
  name: string
  shortDescription: string
  localId: string
  logo?: string
  bannerImage?: string
  taxEnabled: boolean // Indica si el IVA está activado
  taxIncluded: boolean // Indica si el IVA está incluido en los precios
  currencyCode: string
  taxRate: number
}

export interface RestaurantContactInfo {
  phone: string
  email: string
  whatsapp: string
}

export interface RestaurantServiceMethods {
  dineIn: boolean
  delivery: boolean
  takeaway: boolean
  tables: boolean
}

export interface RestaurantLocation {
  address: string
  city: string
  region: string
  coverageZones: CoverageZone[]
}

export interface CoverageZone {
  id: string
  name: string
  deliveryCost: number
}

export interface RestaurantHours {
  schedule: DaySchedule[]
}

export interface DaySchedule {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface RestaurantPaymentMethods {
  methods: PaymentMethod[]
}

export interface PaymentMethod {
  id: string
  name: string
  isActive: boolean
}

export interface RestaurantDeliverySettings {
  estimatedTime: string
  minOrderForFreeDelivery: number
  deliveryCost: number
}

export interface RestaurantSocialMedia {
  facebook?: string
  instagram?: string
  twitter?: string
  tiktok?: string
}

export interface RestaurantConfig {
  basicInfo?: RestaurantBasicInfo
  contactInfo?: RestaurantContactInfo
  serviceMethods?: RestaurantServiceMethods
  location?: RestaurantLocation
  hours?: RestaurantHours
  paymentMethods?: RestaurantPaymentMethods
  deliverySettings?: RestaurantDeliverySettings
  socialMedia?: RestaurantSocialMedia
  updatedAt: string
  branchId: string // Añadido para identificar a qué sucursal pertenece
}

// Función para obtener la configuración completa del restaurante para una sucursal específica
export async function getRestaurantConfig(tenantId: string, branchId?: string): Promise<RestaurantConfig | null> {
  try {
    if (!branchId) {
      console.log("No se proporcionó ID de sucursal en getRestaurantConfig")
      return null
    }

    console.log(`Obteniendo configuración para tenant: ${tenantId}, sucursal: ${branchId}`)

    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (!configDoc.exists()) {
      console.log(`No existe configuración para la sucursal ${branchId}`)
      return null
    }

    const configData = configDoc.data() as RestaurantConfig
    console.log(`Configuración obtenida para sucursal ${branchId}:`, configData)

    return configData
  } catch (error) {
    console.error("Error al obtener configuración del restaurante:", error)
    throw error // Lanzamos el error para manejarlo en el hook
  }
}

// Corregir la función updateRestaurantConfigSection para que maneje correctamente los parámetros

// Reemplazar la función updateRestaurantConfigSection con esta versión corregida:
export async function updateRestaurantConfigSection<T>(
  tenantId: string,
  section: string,
  data: T,
  branchId?: string,
): Promise<void> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Actualizando sección ${section} para tenant: ${tenantId}, sucursal: ${branchId}`)

    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      // Actualizar solo la sección específica
      await updateDoc(configRef, {
        [section]: data,
        updatedAt: new Date().toISOString(),
        branchId: branchId,
      })
      console.log(`Sección ${section} actualizada correctamente para sucursal ${branchId}`)
    } else {
      // Crear un documento inicial con la sección proporcionada
      const initialConfig: Partial<RestaurantConfig> = {
        [section]: data,
        updatedAt: new Date().toISOString(),
        branchId: branchId,
      }
      await setDoc(configRef, initialConfig)
      console.log(`Creada configuración inicial con sección ${section} para sucursal ${branchId}`)
    }
  } catch (error) {
    console.error(`Error al actualizar sección ${section}:`, error)
    throw error
  }
}

// Función para subir el logo del restaurante usando Vercel Blob
export async function uploadRestaurantLogo(tenantId: string, branchId: string, file: File): Promise<string> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Subiendo logo para tenant: ${tenantId}, sucursal: ${branchId}`)

    // Crear FormData para enviar el archivo
    const formData = new FormData()
    formData.append("file", file)
    formData.append("tenantId", tenantId)
    formData.append("branchId", branchId)
    formData.append("type", "logo")

    // Subir el archivo usando la API
    const response = await fetch("/api/upload/restaurant-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al subir el archivo")
    }

    const { url } = await response.json()

    // Actualizar la configuración con la nueva URL
    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      const currentConfig = configDoc.data() as RestaurantConfig
      const updatedBasicInfo = {
        ...currentConfig.basicInfo,
        logo: url,
      }

      await updateDoc(configRef, {
        basicInfo: updatedBasicInfo,
        updatedAt: new Date().toISOString(),
      })
    }

    console.log(`Logo subido correctamente para sucursal ${branchId}`)
    return url
  } catch (error) {
    console.error("Error al subir logo del restaurante:", error)
    throw error
  }
}

// Función para eliminar el logo del restaurante
export async function deleteRestaurantLogo(tenantId: string, branchId: string, logoUrl?: string): Promise<void> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Eliminando logo para tenant: ${tenantId}, sucursal: ${branchId}`)

    // Si tenemos la URL del logo, intentar eliminarlo de Blob
    if (logoUrl) {
      try {
        await fetch("/api/upload/restaurant-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: logoUrl }),
        })
      } catch (blobError) {
        console.warn("Error al eliminar archivo de Blob:", blobError)
        // Continuar con la actualización de la configuración aunque falle la eliminación del archivo
      }
    }

    // Actualizar la configuración para quitar la URL
    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      const currentConfig = configDoc.data() as RestaurantConfig
      const updatedBasicInfo = {
        ...currentConfig.basicInfo,
        logo: "",
      }

      await updateDoc(configRef, {
        basicInfo: updatedBasicInfo,
        updatedAt: new Date().toISOString(),
      })
    }

    console.log(`Logo eliminado correctamente para sucursal ${branchId}`)
  } catch (error) {
    console.error("Error al eliminar logo del restaurante:", error)
    throw error
  }
}

// Función para subir el banner del restaurante usando Vercel Blob
export async function uploadRestaurantBanner(tenantId: string, branchId: string, file: File): Promise<string> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Subiendo banner para tenant: ${tenantId}, sucursal: ${branchId}`)

    // Crear FormData para enviar el archivo
    const formData = new FormData()
    formData.append("file", file)
    formData.append("tenantId", tenantId)
    formData.append("branchId", branchId)
    formData.append("type", "banner")

    // Subir el archivo usando la API
    const response = await fetch("/api/upload/restaurant-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al subir el archivo")
    }

    const { url } = await response.json()

    // Actualizar la configuración con la nueva URL
    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      const currentConfig = configDoc.data() as RestaurantConfig
      const updatedBasicInfo = {
        ...currentConfig.basicInfo,
        bannerImage: url,
      }

      await updateDoc(configRef, {
        basicInfo: updatedBasicInfo,
        updatedAt: new Date().toISOString(),
      })
    }

    console.log(`Banner subido correctamente para sucursal ${branchId}`)
    return url
  } catch (error) {
    console.error("Error al subir banner del restaurante:", error)
    throw error
  }
}

// Función para eliminar el banner del restaurante
export async function deleteRestaurantBanner(tenantId: string, branchId: string, bannerUrl?: string): Promise<void> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Eliminando banner para tenant: ${tenantId}, sucursal: ${branchId}`)

    // Si tenemos la URL del banner, intentar eliminarlo de Blob
    if (bannerUrl) {
      try {
        await fetch("/api/upload/restaurant-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: bannerUrl }),
        })
      } catch (blobError) {
        console.warn("Error al eliminar archivo de Blob:", blobError)
        // Continuar con la actualización de la configuración aunque falle la eliminación del archivo
      }
    }

    // Actualizar la configuración para quitar la URL
    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      const currentConfig = configDoc.data() as RestaurantConfig
      const updatedBasicInfo = {
        ...currentConfig.basicInfo,
        bannerImage: "",
      }

      await updateDoc(configRef, {
        basicInfo: updatedBasicInfo,
        updatedAt: new Date().toISOString(),
      })
    }

    console.log(`Banner eliminado correctamente para sucursal ${branchId}`)
  } catch (error) {
    console.error("Error al eliminar banner del restaurante:", error)
    throw error
  }
}

// Función para inicializar la configuración con valores predeterminados
export async function initializeRestaurantConfig(
  tenantId: string,
  branchId: string,
  restaurantName: string,
): Promise<RestaurantConfig> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Inicializando configuración para tenant: ${tenantId}, sucursal: ${branchId}`)

    const defaultConfig: RestaurantConfig = {
      basicInfo: {
        name: restaurantName,
        shortDescription: "",
        localId: tenantId,
        taxEnabled: false, // IVA desactivado por defecto
        taxIncluded: true, // IVA incluido en los precios por defecto
        currencyCode: "CLP", // Peso chileno por defecto
        taxRate: 0.19, // 19% por defecto (Chile)
      },
      contactInfo: {
        phone: "",
        email: "",
        whatsapp: "",
      },
      serviceMethods: {
        dineIn: true,
        delivery: false,
        takeaway: false,
        tables: true,
      },
      location: {
        address: "",
        city: "",
        region: "",
        coverageZones: [],
      },
      hours: {
        schedule: [
          { day: "Lunes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
          { day: "Martes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
          { day: "Miércoles", isOpen: true, openTime: "09:00", closeTime: "18:00" },
          { day: "Jueves", isOpen: true, openTime: "09:00", closeTime: "18:00" },
          { day: "Viernes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
          { day: "Sábado", isOpen: true, openTime: "10:00", closeTime: "15:00" },
          { day: "Domingo", isOpen: false, openTime: "00:00", closeTime: "00:00" },
        ],
      },
      paymentMethods: {
        methods: [
          { id: "cash", name: "Efectivo", isActive: true },
          { id: "credit_card", name: "Tarjeta de Crédito", isActive: false },
          { id: "debit_card", name: "Tarjeta de Débito", isActive: false },
          { id: "transfer", name: "Transferencia Bancaria", isActive: false },
        ],
      },
      deliverySettings: {
        estimatedTime: "30-45",
        minOrderForFreeDelivery: 0,
        deliveryCost: 0,
      },
      socialMedia: {
        facebook: "",
        instagram: "",
        twitter: "",
        tiktok: "",
      },
      updatedAt: new Date().toISOString(),
      branchId: branchId,
    }

    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")
    await setDoc(configRef, defaultConfig)

    console.log(`Configuración inicializada correctamente para sucursal ${branchId}`)
    return defaultConfig
  } catch (error) {
    console.error("Error al inicializar configuración del restaurante:", error)
    throw error
  }
}

export async function updateRestaurantConfig(
  tenantId: string,
  branchId: string,
  config: RestaurantConfig,
): Promise<void> {
  try {
    if (!branchId) {
      throw new Error("No se proporcionó ID de sucursal")
    }

    console.log(`Actualizando configuración para tenant: ${tenantId}, sucursal: ${branchId}`)

    const configRef = doc(db, `tenants/${tenantId}/branches/${branchId}/config`, "restaurant")

    await setDoc(configRef, config, { merge: true })

    console.log(`Configuración actualizada correctamente para sucursal ${branchId}`)
  } catch (error) {
    console.error("Error al actualizar configuración del restaurante:", error)
    throw error
  }
}
