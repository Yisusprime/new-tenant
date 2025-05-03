/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Añadir configuración para manejar módulos de Node.js en el cliente
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configuración para el cliente
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        http2: false,
        dns: false,
        child_process: false,
        path: false,
      }
    }
    return config
  },
}

export default nextConfig
