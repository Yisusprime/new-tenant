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
    ];
  },
};

export default nextConfig;
