import { cookies } from "next/headers"
import type { CookieOptions } from "next/dist/server/web/spec-extension/cookies"

// Session timeout in milliseconds (30 minutes by default)
export const SESSION_TIMEOUT = 30 * 60 * 1000

export const setCookie = (name: string, value: string, options?: CookieOptions) => {
  const cookieStore = cookies()
  cookieStore.set(name, value, options)
}

export const getCookie = (name: string) => {
  const cookieStore = cookies()
  return cookieStore.get(name)
}

export const deleteCookie = (name: string) => {
  const cookieStore = cookies()
  cookieStore.delete(name)
}
