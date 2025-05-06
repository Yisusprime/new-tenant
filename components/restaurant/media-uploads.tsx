import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BlobImageUploader } from "@/components/blob-image-uploader"

interface MediaUploadsProps {
  tenantData: any
  tenantId: string | null
  handleLogoUpload: (url: string) => void
  handleBannerUpload: (url: string) => void
}

export function MediaUploads({ tenantData, tenantId, handleLogoUpload, handleBannerUpload }: MediaUploadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes del Restaurante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label>Logo del Restaurante</Label>
          <div className="flex gap-4 items-center">
            <div className="w-24 h-24 flex-shrink-0">
              <BlobImageUploader
                currentImageUrl={tenantData.logoUrl}
                onImageUploaded={handleLogoUpload}
                folder="logos"
                aspectRatio="square"
                tenantId={tenantId || undefined}
                className="h-24"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-2">Sube el logo de tu restaurante</p>
              <p className="text-xs text-muted-foreground">Recomendado: Imagen cuadrada de al menos 200x200px</p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 mt-4">
          <Label>Banner del Restaurante</Label>
          <div className="flex gap-4 items-center">
            <div className="w-40 flex-shrink-0">
              <BlobImageUploader
                currentImageUrl={tenantData.bannerUrl}
                onImageUploaded={handleBannerUpload}
                folder="banners"
                aspectRatio="wide"
                tenantId={tenantId || undefined}
                className="h-20"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-2">Sube el banner de tu restaurante</p>
              <p className="text-xs text-muted-foreground">Recomendado: Imagen panorámica de al menos 1200x400px</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
