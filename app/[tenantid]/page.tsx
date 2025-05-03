import { redirect } from "next/navigation"

export default function TenantIndexPage({ params }: { params: { tenantid: string } }) {
  const { tenantid } = params
  redirect(`/${tenantid}/admin/dashboard`)
}
