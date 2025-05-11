export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export function handleCors(headers: Headers = new Headers()): Headers {
  const newHeaders = new Headers(headers)

  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value)
  })

  return newHeaders
}
