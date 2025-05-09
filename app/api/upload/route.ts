import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const filename = formData.get("filename") as string

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: "No se proporcionó un nombre de archivo" }, { status: 400 })
    }

    // Subir el archivo a Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "No se proporcionó una URL" }, { status: 400 })
    }

    // Eliminar el archivo de Vercel Blob
    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar archivo:", error)
    return NextResponse.json({ error: "Error al eliminar archivo" }, { status: 500 })
  }
}
