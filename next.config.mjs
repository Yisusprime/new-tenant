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
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  // Configuración para manejar subdominios
  async rewrites() {
    return [
      // Redirigir subdominios a la ruta /tenant/[subdomain]
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+).gastroo.online',
          },
        ],
        destination: '/tenant/:subdomain/:path*',
      },
      // Manejar rutas de admin en subdominios
      {
        source: '/admin/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+).gastroo.online',
          },
        ],
        destination: '/tenant/:subdomain/admin/:path*',
      },
      // Manejar rutas de client en subdominios
      {
        source: '/client/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+).gastroo.online',
          },
        ],
        destination: '/tenant/:subdomain/client/:path*',
      },
    ];
  },
  // Configuración para el tiempo de construcción
  experimental: {
    // Esto ayuda con las rutas dinámicas durante la construcción
    workerThreads: false,
    cpus: 1
  },
};

export default nextConfig;
