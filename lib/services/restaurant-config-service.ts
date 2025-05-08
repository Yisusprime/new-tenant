import { db, storage } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"

export interface RestaurantBasicInfo {
  name: string
  shortDescription: string
  localId: string
  logo?: string
  taxIncluded: boolean
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
  basicInfo: RestaurantBasicInfo
  contactInfo: RestaurantContactInfo
  serviceMethods: RestaurantServiceMethods
  location: RestaurantLocation
  hours: RestaurantHours
  paymentMethods: RestaurantPaymentMethods
  deliverySettings: RestaurantDeliverySettings
  socialMedia: RestaurantSocialMedia
  updatedAt: string
}

// Función para obtener la configuración completa del restaurante
export async function getRestaurantConfig(tenantId: string): Promise<RestaurantConfig | null> {
  try {
    const configDoc = await getDoc(doc(db, `tenants/${tenantId}/config`, "restaurant"))

    if (!configDoc.exists()) {
      return null
    }

    return configDoc.data() as RestaurantConfig
  } catch (error) {
    console.error("Error al obtener configuración del restaurante:", error)
    throw error
  }
}

// Función para actualizar una sección específica de la configuración
export async function updateRestaurantConfigSection<T>(
  tenantId: string,
  section: keyof RestaurantConfig,
  data: T,
): Promise<void> {
  try {
    const configRef = doc(db, `tenants/${tenantId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      // Actualizar solo la sección específica
      await updateDoc(configRef, {
        [section]: data,
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Crear un documento inicial con la sección proporcionada
      const initialConfig: Partial<RestaurantConfig> = {
        [section]: data,
        updatedAt: new Date().toISOString(),
      }
      await setDoc(configRef, initialConfig)
    }
  } catch (error) {
    console.error(`Error al actualizar sección ${section}:`, error)
    throw error
  }
}

// Función para subir el logo del restaurante
export async function uploadRestaurantLogo(tenantId: string, file: File): Promise<string> {
  try {
    // Crear una referencia al archivo en Storage
    const storageRef = ref(storage, `tenants/${tenantId}/restaurant/logo`)

    // Subir el archivo
    await uploadBytes(storageRef, file)

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef)

    // Actualizar la configuración con la nueva URL
    const configRef = doc(db, `tenants/${tenantId}/config`, "restaurant")
    const configDoc = await getDoc(configRef)

    if (configDoc.exists()) {
      const currentConfig = configDoc.data() as RestaurantConfig
      const updatedBasicInfo = {
        ...currentConfig.basicInfo,
        logo: downloadURL,
      }

      await updateDoc(configRef, {
        basicInfo: updatedBasicInfo,
        updatedAt: new Date().toISOString(),
      })
    }

    return downloadURL
  } catch (error) {
    console.error("Error al subir logo del restaurante:", error)
    throw error
  }
}

// Función para eliminar el logo del restaurante
export async function deleteRestaurantLogo(tenantId: string): Promise<void> {
  try {
    // Crear una referencia al archivo en Storage
    const storageRef = ref(storage, `tenants/${tenantId}/restaurant/logo`)

    // Eliminar el archivo
    await deleteObject(storageRef)

    // Actualizar la configuración para quitar la URL
    const configRef = doc(db, `tenants/${tenantId}/config`, "restaurant")
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
  } catch (error) {
    console.error("Error al eliminar logo del restaurante:", error)
    throw error
  }
}

// Función para inicializar la configuración con valores predeterminados
export async function initializeRestaurantConfig(tenantId: string, restaurantName: string): Promise<RestaurantConfig> {
  try {
    const defaultConfig: RestaurantConfig = {
      basicInfo: {
        name: restaurantName,
        shortDescription: "",
        localId: tenantId,
        taxIncluded: true,
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
    }

    const configRef = doc(db, `tenants/${tenantId}/config`, "restaurant")
    await setDoc(configRef, defaultConfig)

    return defaultConfig
  } catch (error) {
    console.error("Error al inicializar configuración del restaurante:", error)
    throw error
  }
}
