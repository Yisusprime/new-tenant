import { put, del } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const filename = formData.get("filename") as string

    if (!file || !filename) {
      return NextResponse.json({ error: "Se requiere un archivo y un nombre de archivo" }, { status: 400 })
    }

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error al subir archivo a Blob:", error)
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "Se requiere una URL" }, { status: 400 })
    }

    // Eliminar el archivo de Vercel Blob
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar archivo de Blob:", error)
    return NextResponse.json({ error: "Error al eliminar archivo" }, { status: 500 })
  }
}
