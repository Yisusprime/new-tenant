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
  // Resolver el problema de node:process
  webpack: (config, { isServer }) => {
    // Resolver los imports con prefijo node:
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:process': 'process',
      'node:stream': 'stream-browserify',
      'node:buffer': 'buffer',
      'node:util': 'util',
    };

    // Añadir fallbacks para módulos de Node.js en el navegador
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: 'process/browser',
        stream: 'stream-browserify',
        buffer: 'buffer/',
        util: 'util/',
      };
    }

    return config;
  },
};

export default nextConfig;
