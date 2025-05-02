// Re-exportar la función desde firebase-admin-functions.ts para mantener compatibilidad
import { getDomainFromRequest as getDomainFromRequestImpl, type DomainInfo } from "./firebase-admin-functions"

export type { DomainInfo }

export async function getDomainFromRequest(hostname: string): Promise<DomainInfo> {
  return getDomainFromRequestImpl(hostname)
}
