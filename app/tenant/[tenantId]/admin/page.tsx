import { redirect } from "next/navigation"

export default function AdminIndexPage({
  params,
}: {
  params: { tenantId: string }
}) {
  redirect(`/tenant/${params.tenantId}/admin/dashboard`)
}
