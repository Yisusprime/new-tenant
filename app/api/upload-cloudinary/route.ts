import { type NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream"

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Función para convertir un buffer a un stream
function bufferToStream(buffer: Buffer) {
  const readable = new Readable({
    read() {
      this.push(buffer)
      this.push(null)
    },
  })
  return readable
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Convertir el archivo a un array de bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear un stream a partir del buffer
    const stream = bufferToStream(buffer)

    // Subir el archivo a Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Error al subir a Cloudinary:", error)
            resolve(NextResponse.json({ success: false, error: "Error al subir el archivo" }, { status: 500 }))
          } else {
            resolve(
              NextResponse.json({
                success: true,
                url: result?.secure_url,
              }),
            )
          }
        },
      )

      stream.pipe(uploadStream)
    })
  } catch (error: any) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ success: false, error: error.message || "Error al subir el archivo" }, { status: 500 })
  }
}
