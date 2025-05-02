import type { DomainInfo } from "./domains"

// Caché en memoria para consultas de dominio
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos en milisegundos
const domainCache = new Map<string, { data: DomainInfo; timestamp: number }>()

export function getCachedDomainInfo(hostname: string): DomainInfo | null {
  const cached = domainCache.get(hostname)

  if (cached) {
    const now = Date.now()
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
    // Caché expirado, eliminarlo
    domainCache.delete(hostname)
  }

  return null
}

export function setCachedDomainInfo(hostname: string, domainInfo: DomainInfo): void {
  domainCache.set(hostname, {
    data: domainInfo,
    timestamp: Date.now(),
  })
}

export function clearDomainCache(): void {
  domainCache.clear()
}

export function invalidateDomainCache(hostname: string): void {
  domainCache.delete(hostname)
}
