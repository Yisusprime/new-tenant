import { TenantDataProvider } from "@/components/tenant-data-provider"
import TenantHomeContent from "@/components/tenant-home-content"

export default function TenantHomePage({ params }: { params: { tenant: string } }) {
  return (
    <TenantDataProvider subdomain={params.tenant}>
      <TenantHomeContent tenant={params.tenant} />
    </TenantDataProvider>
  )
}
