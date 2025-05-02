/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para manejar dominios comodín en desarrollo local y en Vercel
  async rewrites() {
    return {
      beforeFiles: [
        // Para desarrollo local, reescribir subdominios a la ruta /tenant
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[^.]+).localhost:3000',
            },
          ],
          destination: '/tenant/:path*',
        },
        // Para Vercel, reescribir subdominios con formato tenant--project.vercel.app
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[^-]+)--(?<project>.+).vercel.app',
            },
          ],
          destination: '/tenant/:path*',
        },
      ],
    };
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // No intentar importar módulos de Node.js en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
