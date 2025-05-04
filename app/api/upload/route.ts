import { type NextRequest, NextResponse } from "next/server"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase-config"

export async function POST(request: NextRequest) {
  try {
    // Obtener el archivo de la solicitud
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Convertir el archivo a un array de bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar un nombre de archivo único
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`
    const filePath = `${folder}/${fileName}`

    // Crear referencia al archivo en Storage
    const fileRef = ref(storage, filePath)

    // Subir el archivo
    const snapshot = await uploadBytes(fileRef, buffer)

    // Obtener la URL de descarga
    const downloadUrl = await getDownloadURL(snapshot.ref)

    // Devolver la URL del archivo subido
    return NextResponse.json({ success: true, url: downloadUrl })
  } catch (error: any) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ success: false, error: error.message || "Error al subir el archivo" }, { status: 500 })
  }
}
