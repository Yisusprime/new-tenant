/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Esto es crucial para manejar firebase-admin correctamente
    serverComponentsExternalPackages: ['firebase-admin'],
    // Esto ayuda a evitar problemas con módulos de Node.js
    serverActions: {
      bodySizeLimit: '2mb',
    },
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
  // Excluir explícitamente la página /_not-found del prerenderizado
  exportPathMap: async function (defaultPathMap) {
    // Eliminar la ruta /_not-found si existe
    if (defaultPathMap['/_not-found']) {
      delete defaultPathMap['/_not-found'];
    }
    return defaultPathMap;
  },
};

export default nextConfig;
