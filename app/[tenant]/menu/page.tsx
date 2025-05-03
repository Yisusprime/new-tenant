import { TenantDataProvider } from "@/components/tenant-data-provider"
import TenantMenuContent from "@/components/tenant-menu-content"

export default function TenantMenuPage({ params }: { params: { tenant: string } }) {
  return (
    <TenantDataProvider subdomain={params.tenant}>
      <TenantMenuContent tenant={params.tenant} />
    </TenantDataProvider>
  )
}
