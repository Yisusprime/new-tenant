export interface Tenant {
  id: string
  name: string
  subdomain: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
  isActive: boolean
  plan: "free" | "premium" | "enterprise"
  customDomain?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
}

export interface TenantUser {
  id: string
  tenantId: string
  userId: string
  role: "admin" | "manager" | "user"
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  isSuperAdmin: boolean
}
